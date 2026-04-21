import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createConnection } from "@/lib/db";

/**
 * GET /api/notifications/unread-count
 * Returns the number of unread notifications for the logged-in user.
 * Used to drive the badge on the bell icon.
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const payload = await verifyToken(token) as any;
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const db = await createConnection();

  try {
    const [rows]: any = await db.query(
      `SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0`,
      [payload.user_id]
    );

    return NextResponse.json({ success: true, count: rows[0].count });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  } finally {
    await db.end();
  }
}
