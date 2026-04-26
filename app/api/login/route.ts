import { createConnection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2/promise";
import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  isTrustedMutationOrigin,
  signToken,
} from "@/lib/auth";
import { logAuthEvent } from "@/lib/authEvents";
import { ensureUsersSessionTokenColumn } from "@/lib/ensureSessionTokenColumn";
import {
  buildLoginRateLimitKey,
  checkLoginRateLimit,
  getClientIpFromHeaders,
  registerFailedLoginAttempt,
  registerSuccessfulLogin,
} from "@/lib/loginRateLimit";

function buildFullName(firstName: unknown, middleName: unknown, lastName: unknown) {
  return [firstName, middleName, lastName]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .join(" ");
}

export async function POST(req: NextRequest) {
  if (!isTrustedMutationOrigin(req)) {
    return NextResponse.json(
      { success: false, message: "Untrusted request origin." },
      { status: 403 }
    );
  }

  let email: unknown;
  let password: unknown;
  let rememberMe: unknown;
  try {
    ({ email, password, rememberMe } = await req.json());
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return NextResponse.json(
      { success: false, message: "Email and password are required." },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const clientIp = getClientIpFromHeaders(req.headers);
  const rateLimitKey = buildLoginRateLimitKey(clientIp, normalizedEmail);
  const rateCheck = checkLoginRateLimit(rateLimitKey);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many login attempts. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateCheck.retryAfterSeconds),
        },
      }
    );
  }

  const db = await createConnection();
  try {
    await ensureUsersSessionTokenColumn(db);

    type LoginUserRow = RowDataPacket & {
      user_id: number;
      first_name: string;
      middle_name: string | null;
      last_name: string;
      email: string;
      password: string;
      role: string;
      profile_picture: string | null;
      account_status: string | null;
    };

    const [rows] = await db.query<LoginUserRow[]>(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    const user = rows[0];

    if (!user) {
      registerFailedLoginAttempt(rateLimitKey);
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (user.account_status && String(user.account_status).toLowerCase() !== "active") {
      registerFailedLoginAttempt(rateLimitKey);
      return NextResponse.json(
        { success: false, message: "This account is not active." },
        { status: 403 }
      );
    }

    const looksHashed = typeof user.password === "string" && user.password.startsWith("$2");
    let passwordMatches = false;

    if (looksHashed) {
      passwordMatches = await bcrypt.compare(password, user.password);
    } else {
      passwordMatches = password === String(user.password ?? "");
      if (passwordMatches) {
        const upgradedHash = await bcrypt.hash(password, 10);
        await db.query("UPDATE users SET password = ? WHERE user_id = ?", [
          upgradedHash,
          user.user_id,
        ]);
      }
    }

    if (!passwordMatches) {
      registerFailedLoginAttempt(rateLimitKey);
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const role = String(user.role ?? "").trim().toLowerCase();

    if (role === "student" || role === "signatory") {
      const [activePeriods] = await db.query<RowDataPacket[]>(
        "SELECT period_id FROM clearance_periods WHERE period_status = 'live' ORDER BY created_at DESC LIMIT 1"
      );

      if (activePeriods.length === 0) {
        return NextResponse.json(
          { success: false, message: "No active clearance period found." },
          { status: 403 }
        );
      }
    }

    const rememberMeEnabled = Boolean(rememberMe);
    const maxAgeSeconds = rememberMeEnabled ? 60 * 60 * 24 * 30 : 60 * 60 * 12;

    const sid = crypto.randomUUID();
    await db.query("UPDATE users SET session_token = ? WHERE user_id = ?", [sid, user.user_id]);

    const token = await signToken(
      {
        user_id: user.user_id,
        full_name: buildFullName(user.first_name, user.middle_name, user.last_name),
        email: user.email,  
        role,
        avatar: user.profile_picture,
        sid,
      },
      maxAgeSeconds
    );

    const response = NextResponse.json({
      success: true,
      user: {
        user_id: user.user_id,
        full_name: buildFullName(user.first_name, user.middle_name, user.last_name),
        email: user.email,
        role,
        avatar: user.profile_picture,
      },
    });

    registerSuccessfulLogin(rateLimitKey);
    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions(maxAgeSeconds));

    try {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        req.headers.get("x-real-ip") ??
        null;
      const ua = req.headers.get("user-agent") ?? null;
      await logAuthEvent(db, user.user_id, "login", ip, ua);
    } catch {
      /* non-blocking */
    }

    return response;
  } catch (error: unknown) {
    console.error("[login] unexpected error", error);
    return NextResponse.json({ success: false, message: "Login failed." }, { status: 500 });
  } finally {
    await db.end();
  }
}
