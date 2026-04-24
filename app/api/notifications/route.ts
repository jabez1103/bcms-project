import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createConnection } from "@/lib/db";

/**
 * GET /api/notifications
 * Returns all notifications for the logged-in user, newest first.
 */

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const payload = await verifyToken(token) as any;
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const db = await createConnection();

  try {
    const [rows]: any = await db.query(
      `SELECT
         notification_id  AS id,
         type,
         title,
         message,
         target_id        AS targetId,
         is_read          AS isRead,
         created_at       AS createdAt
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [payload.user_id]
    );

    return NextResponse.json({ success: true, notifications: rows });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  } finally {
    await db.end();
  }
}
