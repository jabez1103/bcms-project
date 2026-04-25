import { NextRequest, NextResponse } from "next/server";
import { isTrustedMutationOrigin } from "@/lib/auth";
import { createConnection } from "@/lib/db";
import { createNotificationBulk } from "@/lib/notifications";
import type { RowDataPacket } from "mysql2/promise";

export async function POST(request: NextRequest) {
  if (!isTrustedMutationOrigin(request)) {
    return NextResponse.json(
      { success: false, message: "Untrusted request origin." },
      { status: 403 },
    );
  }

  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    email = String(body?.email ?? "").trim().toLowerCase();
  } catch {
    email = "";
  }

  if (!email || !/^[a-z0-9._%+-]+@bisu\.edu\.ph$/.test(email)) {
    return NextResponse.json(
      {
        success: false,
        message: "Please provide a valid institutional email.",
      },
      { status: 400 },
    );
  }

  const db = await createConnection();
  try {
    type AdminRow = RowDataPacket & { user_id: number };
    const [admins] = await db.query<AdminRow[]>(
      "SELECT user_id FROM users WHERE LOWER(role) = 'admin' AND LOWER(account_status) = 'active'",
    );

    await createNotificationBulk(
      db,
      admins.map((row) => ({ userId: Number(row.user_id), role: "admin" as const })),
      "password_reset_requested",
      "Password Reset Request",
      `A user requested a password reset for ${email}. Please review and reset the account if verified.`,
    );
  } catch {
    // Avoid leaking internal errors to public endpoint callers.
  } finally {
    await db.end();
  }

  return NextResponse.json(
    {
      success: true,
      message:
        "Reset request sent. Please contact an administrator to reset your account.",
    },
    { status: 200 },
  );
}
