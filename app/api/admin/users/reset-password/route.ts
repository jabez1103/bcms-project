import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2/promise";
import { createConnection } from "@/lib/db";
import { verifySessionFromCookies } from "@/lib/requestSession";
import { isTrustedMutationOrigin } from "@/lib/auth";
import { logAuthEvent } from "@/lib/authEvents";

function buildResetPassword(lastName: string, userId: number): string {
  const normalizedLastName = String(lastName ?? "").replaceAll(" ", "");
  const formattedLastName =
    normalizedLastName.length > 0
      ? `${normalizedLastName[0].toUpperCase()}${normalizedLastName.slice(1).toLowerCase()}`
      : "User";
  return `${formattedLastName}${userId}`;
}

export async function POST(request: NextRequest) {
  if (!isTrustedMutationOrigin(request)) {
    return NextResponse.json(
      { success: false, message: "Untrusted request origin." },
      { status: 403 },
    );
  }

  const actor = await verifySessionFromCookies(request);
  if (!actor || String(actor.role).toLowerCase() !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as { userId?: unknown };
  const userId = Number(body.userId);
  if (!Number.isFinite(userId) || userId <= 0) {
    return NextResponse.json(
      { success: false, message: "A valid target user is required." },
      { status: 400 },
    );
  }

  if (Number(actor.user_id) === userId) {
    return NextResponse.json(
      { success: false, message: "You cannot reset your own password from this action." },
      { status: 403 },
    );
  }

  const db = await createConnection();
  try {
    type UserRow = RowDataPacket & {
      user_id: number;
      email: string;
      first_name: string;
      last_name: string;
    };
    const [rows] = await db.query<UserRow[]>(
      "SELECT user_id, email, first_name, last_name FROM users WHERE user_id = ? LIMIT 1",
      [userId],
    );
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    const temporaryPassword = buildResetPassword(rows[0].last_name, rows[0].user_id);
    const hashed = await bcrypt.hash(temporaryPassword, 10);

    await db.query("UPDATE users SET password = ?, session_token = NULL WHERE user_id = ?", [
      hashed,
      userId,
    ]);

    try {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        request.headers.get("x-real-ip") ??
        null;
      const ua = request.headers.get("user-agent") ?? null;
      await logAuthEvent(db, userId, "password_changed", ip, ua);
    } catch {
      // non-blocking audit log
    }

    return NextResponse.json({
      success: true,
      message: "Password reset complete. Share the temporary password securely.",
      user: {
        user_id: rows[0].user_id,
        email: rows[0].email,
        full_name: `${rows[0].first_name} ${rows[0].last_name}`,
      },
      temporaryPassword,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reset password.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  } finally {
    await db.end();
  }
}
