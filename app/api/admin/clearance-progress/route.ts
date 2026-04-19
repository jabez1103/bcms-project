
import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db";

export async function GET() {
  const db = await createConnection();

  // Get all students with their clearance status
  const [students]: any = await db.query(`
    SELECT
      u.user_id AS id,
      CONCAT(u.first_name, ' ', u.last_name) AS name,
      u.first_name,
      u.last_name,
      st.program,
      st.year_level,
      -- A student is "Cleared" only if ALL requirements are approved
      CASE
        WHEN COUNT(r.requirement_id) = 0 THEN 'Not Cleared'
        WHEN COUNT(r.requirement_id) = SUM(CASE WHEN a.decision_status = 'approved' THEN 1 ELSE 0 END)
        THEN 'Cleared'
        ELSE 'Not Cleared'
      END AS status
    FROM users u
    JOIN students st ON st.user_id = u.user_id
    LEFT JOIN submissions s ON s.student_id = st.student_id
    LEFT JOIN requirements r ON r.requirement_id = s.requirement_id
    LEFT JOIN clearance_periods cp ON cp.period_id = r.period_id AND cp.period_status = 'live'
    LEFT JOIN approvals a ON a.submission_id = s.submission_id
    WHERE u.role = 'student' AND u.account_status = 'active'
    GROUP BY u.user_id, u.first_name, u.last_name, st.program, st.year_level
    ORDER BY st.year_level ASC, u.last_name ASC
  `);

  return NextResponse.json({ success: true, students });
}