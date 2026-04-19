
import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db";

export async function GET() {
  const db = await createConnection();

  //  Get all students with their clearance status
  const [students]: any = await db.query(`
    SELECT
      u.user_id,
      u.first_name,
      u.middle_name,
      u.last_name,
      s.student_id,
      s.program,
      s.year_level,
      -- Cleared = all requirements approved, Not Cleared = otherwise
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
  `);

  //  Summary stats
  const total = students.length;
  const cleared = students.filter((s: any) => s.status === 'Cleared').length;
  const notCleared = total - cleared;

  //  Chart data per program
  const programs = [...new Set(students.map((s: any) => s.program).filter(Boolean))];
  const chartData = programs.map((prog) => {
    const group = students.filter((s: any) => s.program === prog);
    return {
      name: prog,
      cleared: group.filter((s: any) => s.status === 'Cleared').length,
      notCleared: group.filter((s: any) => s.status === 'Not Cleared').length,
    };
  });

  return NextResponse.json({
    success: true,
    stats: { total, cleared, notCleared },
    chartData,
    students,
  });
}