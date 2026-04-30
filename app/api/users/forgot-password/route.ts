import { NextRequest, NextResponse } from "next/server";
import { isTrustedMutationOrigin } from "@/lib/auth";
import { createConnection } from "@/lib/db";
import { createNotificationBulk } from "@/lib/notifications";
import type { RowDataPacket } from "mysql2/promise";

const RESET_COOLDOWN_MS = 24 * 60 * 60 * 1000;

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
    type RequestedUserRow = RowDataPacket & { user_id: number; first_name: string; last_name: string };
    const [requestedUsers] = await db.query<RequestedUserRow[]>(
      "SELECT user_id, first_name, last_name FROM users WHERE email = ? LIMIT 1",
      [email],
    );
    const requestedUser = requestedUsers[0];
    const requestedUserName = requestedUser
      ? `${requestedUser.first_name} ${requestedUser.last_name}`.trim()
      : null;

    if (requestedUser) {
      type ResetEventRow = RowDataPacket & { created_at: string | Date };
      const [resetEvents] = await db.query<ResetEventRow[]>(
        `SELECT created_at
         FROM auth_events
         WHERE user_id = ? AND event_type = 'password_reset_by_admin'
         ORDER BY created_at DESC
         LIMIT 1`,
        [requestedUser.user_id],
      );
      const lastReset = resetEvents[0];
      if (lastReset) {
        const lastResetAtMs = new Date(lastReset.created_at).getTime();
        const nextRequestAtMs = lastResetAtMs + RESET_COOLDOWN_MS;
        if (Number.isFinite(nextRequestAtMs) && nextRequestAtMs > Date.now()) {
          const nextRequestAtText = new Date(nextRequestAtMs).toLocaleString();
          const nextRequestAtIso = new Date(nextRequestAtMs).toISOString();
          return NextResponse.json(
            {
              success: false,
              message: `Your account was already reset recently. Next reset request will be available at ${nextRequestAtText}.`,
              nextRequestAt: nextRequestAtIso,
            },
            { status: 429 },
          );
        }
      }
    }

    type AdminRow = RowDataPacket & { user_id: number };
    const [admins] = await db.query<AdminRow[]>(
      "SELECT user_id FROM users WHERE LOWER(role) = 'admin' AND LOWER(account_status) = 'active'",
    );

    // Check if there is an unread password reset request for this email
    type NotifRow = RowDataPacket & { notification_id: number };
    const [recentNotifs] = await db.query<NotifRow[]>(
      `SELECT notification_id FROM notifications 
       WHERE type = 'password_reset_requested' 
         AND is_read = false 
         AND message LIKE ? 
       LIMIT 1`,
       [`%${email}%`]
    );

    if (recentNotifs.length === 0) {
      await createNotificationBulk(
        db,
        admins.map((row) => ({ userId: Number(row.user_id), role: "admin" as const })),
        "password_reset_requested",
        "Password Reset Request",
        requestedUserName
          ? `${requestedUserName} (${email}) requested a password reset. Click to open the account list with this user filtered.`
          : `A user requested a password reset for ${email}. Please review and reset the account if verified.`,
        {
          targetId: requestedUser ? Number(requestedUser.user_id) : undefined,
        },
      );
    }
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
