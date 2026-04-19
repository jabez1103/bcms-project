import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createConnection } from "@/lib/db";

// Auto-update status based on dates
function computeStatus(start: string, end: string): string {
  const now = new Date().toISOString().split("T")[0];
  if (now > end) return "ended";
  if (now >= start) return "live";
  return "scheduled";
}

export async function GET() {
  const db = await createConnection();

  // Auto-update ended periods on every fetch
  await db.query(`
    UPDATE clearance_periods
    SET period_status = 'ended'
    WHERE end_date < CURDATE() AND period_status != 'ended'
  `);

  await db.query(`
    UPDATE clearance_periods
    SET period_status = 'live'
    WHERE start_date <= CURDATE() AND end_date >= CURDATE() AND period_status != 'live'
  `);

  const [rows] = await db.query(`
    SELECT cp.*, CONCAT(u.first_name, ' ', u.last_name) AS set_by
    FROM clearance_periods cp
    LEFT JOIN administrators a ON cp.admin_id = a.admin_id
    LEFT JOIN users u ON a.user_id = u.user_id
    ORDER BY cp.created_at DESC
  `);

  return NextResponse.json({ success: true, periods: rows });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const payload = await verifyToken(token) as any;
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { academic_year, semester, start_date, end_date } = await request.json();

  if (!academic_year || !start_date || !end_date)
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });

  if (end_date <= start_date)
    return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });

  const db = await createConnection();

  // Get admin_id from administrators table
  const [adminRows]: any = await db.query(
    `SELECT a.admin_id FROM administrators a
     JOIN users u ON a.user_id = u.user_id
     WHERE u.user_id = ?`,
    [payload.user_id]
  );

  if (adminRows.length === 0)
    return NextResponse.json({ error: "Admin not found" }, { status: 403 });

  const admin_id = adminRows[0].admin_id;
  const period_status = computeStatus(start_date, end_date);

  await db.query(
    `INSERT INTO clearance_periods (academic_year, semester, start_date, end_date, period_status, admin_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [academic_year, semester || null, start_date, end_date, period_status, admin_id]
  );

  return NextResponse.json({ success: true, message: "Period created!" });
}