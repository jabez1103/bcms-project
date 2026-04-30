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
    const [activePeriodRows] = await db.query(
      `SELECT period_id FROM clearance_periods WHERE period_status = 'live' ORDER BY created_at DESC LIMIT 1`
    ) as [Array<{ period_id: number }>, unknown];

    const currentPeriodId = activePeriodRows.length > 0 ? activePeriodRows[0].period_id : null;

    let query = `SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0`;
    const params: any[] = [payload.user_id];

    if (currentPeriodId != null) {
      query += ` AND clearance_period_id = ?`;
      params.push(currentPeriodId);
    }

    const [rows] = await db.query<CountRow[]>(query, params);

    return NextResponse.json({ success: true, count: rows[0].count });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch unread count";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    await db.end();
  }
}
