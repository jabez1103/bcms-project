import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createConnection } from "@/lib/db";

/**
 * GET /api/student/activity-logs/system-history
 * Returns major system events for the student:
 *   - Account creation
 *   - Clearance periods they participated in (submitted at least one requirement)
 *   - Any live/ended clearance period they were enrolled during
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const payload = await verifyToken(token) as any;
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const db = await createConnection();

  try {
    const [student]: any = await db.query(
      `SELECT st.student_id, st.program, st.year_level, u.created_at
       FROM students st
       JOIN users u ON st.user_id = u.user_id
       WHERE st.user_id = ?`,
      [payload.user_id]
    );
    if (student.length === 0)
      return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const { student_id, program, year_level, created_at } = student[0];

    const events: { id: number; action: string; status: string; time: string }[] = [];
    let idCounter = 1;

    // 1. Account created
    events.push({
      id: idCounter++,
      action: "Account created",
      status: "neutral",
      time: formatDate(created_at),
    });

    // 2. Enrolled info
    events.push({
      id: idCounter++,
      action: `Enrolled in ${program} — ${year_level}`,
      status: "neutral",
      time: formatDate(created_at),
    });

    // 3. Clearance periods (live + ended) where the student has submitted at least once
    const [periods]: any = await db.query(
      `SELECT DISTINCT
         cp.period_id,
         cp.academic_year,
         cp.semester,
         cp.period_status,
         cp.start_date
       FROM clearance_periods cp
       JOIN requirements req ON req.period_id = cp.period_id
       JOIN submissions sub  ON sub.requirement_id = req.requirement_id AND sub.student_id = ?
       WHERE cp.period_status IN ('live', 'ended')
       ORDER BY cp.start_date ASC`,
      [student_id]
    );

    for (const p of periods) {
      const label = p.semester
        ? `${p.academic_year} — ${p.semester}`
        : p.academic_year;

      events.push({
        id: idCounter++,
        action: `Clearance period started: ${label}`,
        status: p.period_status === "live" ? "active" : "neutral",
        time: formatDate(p.start_date),
      });

      if (p.period_status === "ended") {
        events.push({
          id: idCounter++,
          action: `Clearance period ended: ${label}`,
          status: "neutral",
          time: formatDate(p.start_date), // approximate; no end_date stored per row
        });
      }
    }

    // Sort ascending by natural order (account first, then periods)
    return NextResponse.json({ success: true, history: events });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  } finally {
    await db.end();
  }
}

function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
