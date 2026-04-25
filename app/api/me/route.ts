import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  isTrustedMutationOrigin,
  signToken,
} from "@/lib/auth";
import { createConnection } from "@/lib/db";
import {
  verifySessionFromCookies,
  verifySessionFromCookiesDetailed,
} from "@/lib/requestSession";
import type { RowDataPacket } from "mysql2/promise";
import { ensureUsersContactNumberColumn } from "@/lib/ensureUsersContactNumberColumn";

function buildFullName(firstName: unknown, middleName: unknown, lastName: unknown) {
  return [firstName, middleName, lastName]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .join(" ");
}

export async function GET(request: NextRequest) {
  const session = await verifySessionFromCookiesDetailed(request);

  if (!session.ok) {
    // Avoid clearing cookies here to prevent race conditions where an older
    // unauthenticated /api/me request wipes a freshly established session.
    return NextResponse.json(
      { error: "Invalid or expired session.", reason: session.reason },
      { status: 401 }
    );
  }

  const db = await createConnection();
  try {
    await ensureUsersContactNumberColumn(db);
    const userId = Number(session.payload.user_id);
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT first_name, middle_name, last_name, email, role, profile_picture, contact_number
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [userId]
    );
    const row = rows[0];
    const contactNumber = row?.contact_number != null ? String(row.contact_number) : null;
    const fullNameFromDb =
      row != null
        ? buildFullName(row.first_name, row.middle_name, row.last_name)
        : String(session.payload.full_name ?? "");

    const response = NextResponse.json({
      success: true,
      user: {
        ...session.payload,
        full_name: fullNameFromDb,
        email: row?.email ?? session.payload.email,
        role: row?.role ?? session.payload.role,
        avatar: row?.profile_picture ?? session.payload.avatar ?? null,
        contact_number: contactNumber,
      },
    });
    return response;
  } finally {
    await db.end();
  }
}

export async function PATCH(request: NextRequest) {
  if (!isTrustedMutationOrigin(request)) {
    return NextResponse.json(
      { success: false, message: "Untrusted request origin." },
      { status: 403 }
    );
  }

  const payload = await verifySessionFromCookies(request);
  if (!payload) {
    return NextResponse.json({ success: false, message: "Invalid session." }, { status: 401 });
  }

  const sid = typeof payload.sid === "string" ? payload.sid : null;
  if (!sid) {
    return NextResponse.json({ success: false, message: "Invalid session." }, { status: 401 });
  }

  const body = await request.json();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const contactNumberRaw = String(body?.contact_number ?? "").trim();
  const contactNumber = contactNumberRaw.length > 0 ? contactNumberRaw : null;

  if (!email) {
    return NextResponse.json({ success: false, message: "Email is required." }, { status: 400 });
  }

  if (!/^[a-z0-9._%+-]+@bisu\.edu\.ph$/.test(email)) {
    return NextResponse.json(
      { success: false, message: "Email must use @bisu.edu.ph." },
      { status: 400 }
    );
  }

  if (contactNumber && !/^[0-9+\-\s()]{7,20}$/.test(contactNumber)) {
    return NextResponse.json(
      { success: false, message: "Contact number format is invalid." },
      { status: 400 }
    );
  }

  const db = await createConnection();
  try {
    await ensureUsersContactNumberColumn(db);
    const userId = Number(payload.user_id);
    type UserRow = RowDataPacket & {
      user_id: number;
      first_name: string;
      middle_name: string | null;
      last_name: string;
      email: string;
      role: string;
      profile_picture: string | null;
      contact_number: string | null;
    };

    const [emailConflict] = await db.query<RowDataPacket[]>(
      "SELECT user_id FROM users WHERE email = ? AND user_id <> ? LIMIT 1",
      [email, userId]
    );
    if (emailConflict.length > 0) {
      return NextResponse.json(
        { success: false, message: "Email is already in use." },
        { status: 409 }
      );
    }

    await db.query("UPDATE users SET email = ?, contact_number = ? WHERE user_id = ?", [
      email,
      contactNumber,
      userId,
    ]);

    const [rows] = await db.query<UserRow[]>(
      `SELECT user_id, first_name, last_name, email, role, profile_picture, contact_number
       FROM users WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    const user = rows[0];
    const refreshedToken = await signToken({
      user_id: user.user_id,
      full_name: buildFullName(user.first_name, user.middle_name, user.last_name),
      email: user.email,
      role: user.role,
      avatar: user.profile_picture,
      sid,
    });

    const response = NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        user_id: user.user_id,
        full_name: buildFullName(user.first_name, user.middle_name, user.last_name),
        email: user.email,
        role: user.role,
        avatar: user.profile_picture,
        contact_number: user.contact_number,
      },
    });
    response.cookies.set(AUTH_COOKIE_NAME, refreshedToken, getAuthCookieOptions());
    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update profile." },
      { status: 500 }
    );
  } finally {
    await db.end();
  }
}
