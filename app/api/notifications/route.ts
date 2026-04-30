import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import type { AuthTokenPayload } from "@/lib/auth";
import { verifySessionFromCookies } from "@/lib/requestSession";
import { getNotificationBasePath } from "@/lib/notificationDeepLink";
import type { NotificationRole, NotificationType } from "@/lib/notificationTypes";
import { fetchLatestNotificationsForUser } from "@/lib/notifications";

/**
 * GET /api/notifications
 * Returns the latest notifications for the logged-in user, newest first.
 */

export async function GET(request: NextRequest) {
  const payload: AuthTokenPayload | null = await verifySessionFromCookies(request);
  if (!payload) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const db = await createConnection();

  try {
    const [activePeriodRows] = await db.query(
      `SELECT period_id FROM clearance_periods WHERE period_status = 'live' ORDER BY created_at DESC LIMIT 1`
    ) as [Array<{ period_id: number }>, unknown];

    const currentPeriodId = activePeriodRows.length > 0 ? activePeriodRows[0].period_id : null;

    const rows = await fetchLatestNotificationsForUser(db, Number(payload.user_id), 10, currentPeriodId);

    const role = payload.role as NotificationRole;
    const notifications = rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      targetId: row.targetId,
      isRead: row.isRead,
      createdAt: row.timestamp,
      href: getNotificationBasePath(role, row.type as NotificationType, row.targetId),
    }));

    return NextResponse.json({ success: true, notifications });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch notifications";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    await db.end();
  }
}
