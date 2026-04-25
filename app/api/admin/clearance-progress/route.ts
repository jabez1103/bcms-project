import { verifySessionFromCookies } from "@/lib/requestSession";
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";

import { createConnection } from "@/lib/db";

/**
 * Aggregated clearance progress per student against the **live** clearance period
 * and that student's year band — same rules as `/api/student/clearance-status`.
 */
export async function GET(request: NextRequest) {
  const payload = await verifySessionFromCookies(request);
  if (!payload || String(payload.role).toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await createConnection();

  try {
    const [students] = await db.query<RowDataPacket[]>(
      `SELECT
         st.student_id AS id,
         CONCAT(u.first_name, ' ', u.last_name) AS name,
         u.email,
         u.first_name,
         u.last_name,
         st.program,
         st.year_level,
         'A' AS section,
         COUNT(r.requirement_id) AS total,
         SUM(
           CASE
             WHEN LOWER(
               COALESCE(
                 a.decision_status,
                 CASE WHEN s.submission_id IS NOT NULL THEN 'pending' ELSE 'not_submitted' END
               )
             ) = 'rejected'
             THEN 1 ELSE 0
           END
         ) AS rejected,
         SUM(
           CASE
             WHEN LOWER(
               COALESCE(
                 a.decision_status,
                 CASE WHEN s.submission_id IS NOT NULL THEN 'pending' ELSE 'not_submitted' END
               )
             ) = 'pending'
             THEN 1 ELSE 0
           END
         ) AS pending,
         SUM(
           CASE
             WHEN LOWER(
               COALESCE(
                 a.decision_status,
                 CASE WHEN s.submission_id IS NOT NULL THEN 'pending' ELSE 'not_submitted' END
               )
             ) = 'approved'
             THEN 1 ELSE 0
           END
         ) AS approved,
         CASE
           WHEN COUNT(r.requirement_id) = 0 THEN 'Not Cleared'
           WHEN SUM(
             CASE
               WHEN LOWER(
                 COALESCE(
                   a.decision_status,
                   CASE WHEN s.submission_id IS NOT NULL THEN 'pending' ELSE 'not_submitted' END
                 )
               ) = 'approved'
               THEN 1 ELSE 0
             END
           ) = COUNT(r.requirement_id)
           THEN 'Cleared'
           ELSE 'Not Cleared'
         END AS status
       FROM users u
       INNER JOIN students st ON st.user_id = u.user_id
       INNER JOIN clearance_periods cp ON cp.period_status = 'live'
       INNER JOIN requirements r
         ON r.period_id = cp.period_id
         AND COALESCE(r.req_status, 'active') = 'active'
         AND (
           r.target_year = 'All Years'
           OR r.target_year = CASE st.year_level
             WHEN 1 THEN '1st Year'
             WHEN 2 THEN '2nd Year'
             WHEN 3 THEN '3rd Year'
             WHEN 4 THEN '4th Year'
             ELSE 'All Years'
           END
         )
       LEFT JOIN submissions s
         ON s.requirement_id = r.requirement_id AND s.student_id = st.student_id
       LEFT JOIN approvals a ON a.submission_id = s.submission_id
       WHERE u.role = 'student' AND u.account_status = 'active'
       GROUP BY st.student_id, u.user_id, u.first_name, u.last_name, u.email, st.program, st.year_level
       ORDER BY u.first_name ASC, u.last_name ASC, st.student_id ASC`
    );

    const [signatories] = await db.query<RowDataPacket[]>(
      `SELECT
         sg.signatory_id AS signatory_id,
         CONCAT(u.first_name, ' ', u.last_name) AS signatory_name,
         sg.department,
         COUNT(*) AS total_reviews,
         SUM(CASE WHEN LOWER(COALESCE(a.decision_status, 'pending')) = 'approved' THEN 1 ELSE 0 END) AS approved,
         SUM(CASE WHEN LOWER(COALESCE(a.decision_status, 'pending')) = 'rejected' THEN 1 ELSE 0 END) AS rejected,
         SUM(CASE WHEN LOWER(COALESCE(a.decision_status, 'pending')) = 'pending' THEN 1 ELSE 0 END) AS pending
       FROM clearance_periods cp
       INNER JOIN requirements r
         ON r.period_id = cp.period_id
         AND COALESCE(r.req_status, 'active') = 'active'
       INNER JOIN signatories sg ON r.signatory_id = sg.signatory_id
       INNER JOIN users u ON sg.user_id = u.user_id
       LEFT JOIN submissions s ON s.requirement_id = r.requirement_id
       LEFT JOIN approvals a ON a.submission_id = s.submission_id AND a.signatory_id = sg.signatory_id
       WHERE cp.period_status = 'live'
       GROUP BY sg.signatory_id, u.user_id, sg.department, u.first_name, u.last_name
       ORDER BY sg.department ASC, u.last_name ASC, u.first_name ASC`
    );

    return NextResponse.json({ success: true, students, signatories });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load clearance progress";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    await db.end();
  }
}
