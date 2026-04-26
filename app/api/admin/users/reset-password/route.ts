import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2/promise";
import { createConnection } from "@/lib/db";
import { verifySessionFromCookies } from "@/lib/requestSession";
import { isTrustedMutationOrigin } from "@/lib/auth";
import { logAuthEvent } from "@/lib/authEvents";
import { normalizeLastNameTokenForPassword } from "@/lib/defaultImportedUserCredentials";
import { createNotification } from "@/lib/notifications";

const RESET_COOLDOWN_MS = 24 * 60 * 60 * 1000;

function buildResetPassword(lastName: string, userId: number): string {
  const formattedLastName = normalizeLastNameTokenForPassword(lastName) || "User";
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
      role: string;
    };
    const [rows] = await db.query<UserRow[]>(
      "SELECT user_id, email, first_name, last_name, role FROM users WHERE user_id = ? LIMIT 1",
      [userId],
    );
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    type ResetEventRow = RowDataPacket & { created_at: string | Date };
    const [resetEvents] = await db.query<ResetEventRow[]>(
      `SELECT created_at
       FROM auth_events
       WHERE user_id = ? AND event_type = 'password_reset_by_admin'
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId],
    );
    const lastReset = resetEvents[0];
    if (lastReset) {
      const lastResetAtMs = new Date(lastReset.created_at).getTime();
      const nextResetAtMs = lastResetAtMs + RESET_COOLDOWN_MS;
      if (Number.isFinite(nextResetAtMs) && nextResetAtMs > Date.now()) {
        const nextResetAtIso = new Date(nextResetAtMs).toISOString();
        const nextResetAtText = new Date(nextResetAtMs).toLocaleString();
        return NextResponse.json(
          {
            success: false,
            message: `Password was already reset in the last 24 hours. Next reset is available at ${nextResetAtText}.`,
            nextResetAt: nextResetAtIso,
          },
          { status: 429 },
        );
      }
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
      await logAuthEvent(db, userId, "password_reset_by_admin", ip, ua);
    } catch {
      // non-blocking audit log
    }

    try {
      const nextRequestAtMs = Date.now() + RESET_COOLDOWN_MS;
      const nextRequestAtText = new Date(nextRequestAtMs).toLocaleString();
      const role = String(rows[0].role ?? "").toLowerCase();
      const notifRole =
        role === "admin" || role === "signatory" || role === "student"
          ? (role as "admin" | "signatory" | "student")
          : "student";
      await createNotification({
        db,
        userId: rows[0].user_id,
        role: notifRole,
        type: "password_reset_completed",
        title: "Your Password Was Reset",
        message: `Your account password was reset by an administrator. If you need another reset request, it will be available at ${nextRequestAtText}.`,
      });
    } catch {
      // non-blocking student notification
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
    console.error("[admin/users/reset-password] unexpected error", error);
    return NextResponse.json({ success: false, message: "Failed to reset password." }, { status: 500 });
  } finally {
    await db.end();
  }
}
