import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createConnection } from "@/lib/db";

/**
 * GET /api/student/activity-logs/system-history
 *
 * Returns a chronological list of major system events for the logged-in student:
 *   1. Account creation
 *   2. Enrollment info
 *   3. Auth events  (login / logout / password_changed) — from auth_events table
 *   4. Clearance periods they participated in
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const payload = await verifyToken(token) as any;
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const db = await createConnection();

  try {
    /* ── 1. Student meta ─────────────────────────────────────── */
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

    const events: {
      id: number;
      event_type: string;
      action: string;
      status: string;
      time: string;
      ip_address: string | null;
    }[] = [];

    let idCounter = 1;

    /* ── 2. Account created ──────────────────────────────────── */
    events.push({
      id: idCounter++,
      event_type: "account_created",
      action: "Account created",
      status: "neutral",
      time: formatDate(created_at),
      ip_address: null,
    });

    /* ── 3. Enrolled info ────────────────────────────────────── */
    events.push({
      id: idCounter++,
      event_type: "enrolled",
      action: `Enrolled in ${program} — Year ${year_level}`,
      status: "neutral",
      time: formatDate(created_at),
      ip_address: null,
    });

    /* ── 4. Auth events (login / logout / password_changed) ─── */
    const [authRows]: any = await db.query(
      `SELECT event_id, event_type, ip_address, created_at
       FROM auth_events
       WHERE user_id = ?
       ORDER BY created_at ASC`,
      [payload.user_id]
    );

    for (const ev of authRows) {
      let action = "";
      let status = "neutral";

      if (ev.event_type === "login") {
        action = "Logged in to BCMS";
        status = "login";
      } else if (ev.event_type === "logout") {
        action = "Logged out of BCMS";
        status = "logout";
      } else if (ev.event_type === "password_changed") {
        action = "Password changed";
        status = "password_changed";
      }

      events.push({
        id: idCounter++,
        event_type: ev.event_type,
        action,
        status,
        time: formatDateTime(ev.created_at),
        ip_address: ev.ip_address ?? null,
      });
    }

    /* ── 5. Clearance periods ────────────────────────────────── */
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
        event_type: "period_started",
        action: `Clearance period started: ${label}`,
        status: p.period_status === "live" ? "active" : "neutral",
        time: formatDate(p.start_date),
        ip_address: null,
      });

      if (p.period_status === "ended") {
        events.push({
          id: idCounter++,
          event_type: "period_ended",
          action: `Clearance period ended: ${label}`,
          status: "neutral",
          time: formatDate(p.start_date),
          ip_address: null,
        });
      }
    }

    /* ── Sort by natural insertion order (already chronological) */
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

function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
