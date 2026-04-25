import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import type { AuthTokenPayload } from "@/lib/auth";
import { verifySessionFromCookies } from "@/lib/requestSession";

/**
 * PATCH /api/notifications/read
 *
 * Body options:
 *   { all: true }                  → mark every unread notification as read
 *   { notificationId: number }     → mark a single notification as read
 */
export async function PATCH(request: NextRequest) {
  const payload: AuthTokenPayload | null = await verifySessionFromCookies(request);
  if (!payload) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = await request.json();
  const db = await createConnection();

  try {
    if (body.all === true) {
      await db.query(
        `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`,
        [payload.user_id]
      );
    } else if (body.notificationId) {
      await db.query(
        `UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?`,
        [body.notificationId, payload.user_id]
      );
    } else {
      return NextResponse.json({ error: "Provide notificationId or all: true" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update notifications";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    await db.end();
  }
}
