import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import { verifySessionFromCookies } from "@/lib/requestSession";

export async function GET(request: NextRequest) {
  const payload = await verifySessionFromCookies(request);
  if (!payload || String(payload.role).toLowerCase() !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const db = await createConnection();
  try {
    const [students] = (await db.query(`
    SELECT
      u.user_id,
      u.first_name,
      u.middle_name,
      u.last_name,
      s.student_id,
      s.program,
      s.year_level,
      CASE
        WHEN COUNT(r.requirement_id) = 0 THEN 'Not Cleared'
        WHEN COUNT(r.requirement_id) = SUM(CASE WHEN a.decision_status = 'approved' THEN 1 ELSE 0 END)
        THEN 'Cleared'
        ELSE 'Not Cleared'
      END AS status
    FROM students s
    JOIN users u ON s.user_id = u.user_id
    LEFT JOIN submissions sub ON sub.student_id = s.student_id
    LEFT JOIN requirements r ON r.requirement_id = sub.requirement_id
      AND r.period_id = (
        SELECT period_id FROM clearance_periods
        WHERE period_status = 'live'
        ORDER BY created_at DESC LIMIT 1
      )
    LEFT JOIN approvals a ON a.submission_id = sub.submission_id
    WHERE u.account_status = 'active'
    GROUP BY s.student_id, u.user_id
    ORDER BY u.last_name ASC
  `)) as [Array<{ status: string; program?: string }>, unknown];

    const list = students;
    const total = list.length;
    const cleared = list.filter((s) => s.status === "Cleared").length;
    const notCleared = total - cleared;

    const programs = [...new Set(list.map((s: { program?: string }) => s.program).filter(Boolean))];
    const chartData = programs.map((prog) => {
      const group = list.filter((s: { program?: string }) => s.program === prog);
      return {
        name: prog,
        cleared: group.filter((s) => s.status === "Cleared").length,
        notCleared: group.filter((s) => s.status === "Not Cleared").length,
      };
    });

    return NextResponse.json({
      success: true,
      stats: { total, cleared, notCleared },
      chartData,
      students: list,
    });
  } finally {
    await db.end();
  }
}
