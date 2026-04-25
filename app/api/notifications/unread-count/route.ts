import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import type { AuthTokenPayload } from "@/lib/auth";
import { verifySessionFromCookies } from "@/lib/requestSession";
import type { RowDataPacket } from "mysql2/promise";

/**
 * GET /api/notifications/unread-count
 * Returns the number of unread notifications for the logged-in user.
 * Used to drive the badge on the bell icon.
 */
export async function GET(request: NextRequest) {
  const payload: AuthTokenPayload | null = await verifySessionFromCookies(request);
  if (!payload) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const db = await createConnection();

  try {
    type CountRow = RowDataPacket & { count: number };
    const [rows] = await db.query<CountRow[]>(
      `SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0`,
      [payload.user_id]
    );

    return NextResponse.json({ success: true, count: rows[0].count });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch unread count";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    await db.end();
  }
}
