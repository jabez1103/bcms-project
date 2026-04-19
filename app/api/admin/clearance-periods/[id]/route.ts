import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";

function computeStatus(start: string, end: string): string {
  const now = new Date().toISOString().split("T")[0];
  if (now > end) return "ended";
  if (now >= start) return "live";
  return "scheduled";
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { academic_year, semester, start_date, end_date } = await request.json();

  if (end_date <= start_date)
    return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });

  const period_status = computeStatus(start_date, end_date);
  const db = await createConnection();

  await db.query(
    `UPDATE clearance_periods
     SET academic_year=?, semester=?, start_date=?, end_date=?, period_status=?
     WHERE period_id=?`,
    [academic_year, semester || null, start_date, end_date, period_status, id]
  );

  return NextResponse.json({ success: true, message: "Period updated!" });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await createConnection();
  await db.query(`DELETE FROM clearance_periods WHERE period_id = ?`, [id]);
  return NextResponse.json({ success: true, message: "Period deleted!" });
}