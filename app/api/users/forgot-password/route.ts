import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createConnection } from "@/lib/db";
import { isTrustedMutationOrigin } from "@/lib/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/passwordPolicy";
import { logAuthEvent } from "@/lib/authEvents";
import type { RowDataPacket } from "mysql2/promise";

export async function POST(request: NextRequest) {
  if (!isTrustedMutationOrigin(request)) {
    return NextResponse.json(
      { success: false, message: "Untrusted request origin." },
      { status: 403 },
    );
  }

  const body = await request.json();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const newPassword = String(body?.newPassword ?? "");

  if (!email || !newPassword) {
    return NextResponse.json(
      { success: false, message: "Email and new password are required." },
      { status: 400 },
    );
  }

  if (!/^[a-z0-9._%+-]+@bisu\.edu\.ph$/.test(email)) {
    return NextResponse.json(
      { success: false, message: "Use your institutional @bisu.edu.ph email." },
      { status: 400 },
    );
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { success: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
      { status: 400 },
    );
  }

  const db = await createConnection();

  try {
    type UserRow = RowDataPacket & { user_id: number; email: string };
    const [rows] = await db.query<UserRow[]>(
      "SELECT user_id, email FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "No account found for this email." },
        { status: 404 },
      );
    }

    const user = rows[0];
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE user_id = ?", [hashed, user.user_id]);

    try {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        request.headers.get("x-real-ip") ??
        null;
      const ua = request.headers.get("user-agent") ?? null;
      await logAuthEvent(db, user.user_id, "password_changed", ip, ua);
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Password has been reset. You can now log in.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to reset password." },
      { status: 500 },
    );
  } finally {
    await db.end();
  }
}
