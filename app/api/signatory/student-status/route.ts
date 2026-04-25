import { verifySessionFromCookies } from "@/lib/requestSession";
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";

import { createConnection } from "@/lib/db";

export async function GET(request: NextRequest) {
  const payload = await verifySessionFromCookies(request) as { role?: string; user_id?: number } | null;
  if (!payload || payload.role !== "signatory") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await createConnection();

  const [sigRows] = await db.query<RowDataPacket[]>(
    "SELECT signatory_id FROM signatories WHERE user_id = ?",
    [payload.user_id]
  );
  if (sigRows.length === 0) {
    await db.end();
    return NextResponse.json({ error: "Signatory profile not found" }, { status: 404 });
  }

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT
         s.student_id AS id,
         s.student_id AS studentId,
         CONCAT(u.first_name, ' ', u.last_name) AS name,
         s.program,
         CASE s.year_level
           WHEN 1 THEN '1st Year'
           WHEN 2 THEN '2nd Year'
           WHEN 3 THEN '3rd Year'
           WHEN 4 THEN '4th Year'
           ELSE '1st Year'
         END AS year,
         'A' AS section,
         COUNT(req.requirement_id) AS total,
         COALESCE(SUM(
           CASE
             WHEN LOWER(
               COALESCE(
                 a.decision_status,
                 CASE WHEN sub.submission_id IS NOT NULL THEN 'pending' ELSE 'not_submitted' END
               )
             ) = 'approved'
             THEN 1 ELSE 0
           END
         ), 0) AS approved,
         CASE
           WHEN COUNT(req.requirement_id) = 0 THEN 'Not Cleared'
           WHEN COALESCE(SUM(
             CASE
               WHEN LOWER(
                 COALESCE(
                   a.decision_status,
                   CASE WHEN sub.submission_id IS NOT NULL THEN 'pending' ELSE 'not_submitted' END
                 )
               ) = 'approved'
               THEN 1 ELSE 0
             END
           ), 0) = COUNT(req.requirement_id)
           THEN 'Cleared'
           ELSE 'Not Cleared'
         END AS status,
         CONCAT(
           COALESCE(SUM(CASE WHEN LOWER(COALESCE(a.decision_status, CASE WHEN sub.submission_id IS NOT NULL THEN 'pending' ELSE 'not_submitted' END)) = 'approved' THEN 1 ELSE 0 END), 0),
           ' / ',
           COUNT(req.requirement_id),
           ' approved'
         ) AS requirement,
         MAX(DATE_FORMAT(sub.submission_date, '%M %d, %Y')) AS submittedAt,
         MAX(sub.file_path) AS proofImageUrl,
         MAX(sub.comment) AS comment,
         MAX(CASE WHEN sub.submission_id IS NOT NULL THEN 1 ELSE 0 END) AS hasSubmissionCount
       FROM students s
       JOIN users u ON s.user_id = u.user_id
         AND LOWER(COALESCE(NULLIF(TRIM(u.account_status), ''), 'active')) = 'active'
       LEFT JOIN (
         SELECT period_id
         FROM clearance_periods
         WHERE period_status = 'live'
         ORDER BY created_at DESC
         LIMIT 1
       ) live ON 1 = 1
       LEFT JOIN requirements req
         ON live.period_id IS NOT NULL
         AND req.period_id = live.period_id
         AND COALESCE(req.req_status, 'active') = 'active'
         AND (
           req.target_year = 'All Years'
           OR req.target_year = CASE s.year_level
             WHEN 1 THEN '1st Year'
             WHEN 2 THEN '2nd Year'
             WHEN 3 THEN '3rd Year'
             WHEN 4 THEN '4th Year'
             ELSE 'All Years'
           END
         )
       LEFT JOIN submissions sub
         ON sub.requirement_id = req.requirement_id AND sub.student_id = s.student_id
       LEFT JOIN approvals a ON a.submission_id = sub.submission_id
       GROUP BY s.student_id, u.first_name, u.last_name, s.program, s.year_level
       ORDER BY u.first_name ASC, u.last_name ASC, s.student_id ASC`,
      []
    );

    const toStr = (v: unknown) => (v == null ? "" : String(v));

    const formattedRows = rows.map((r) => {
      const row = r as RowDataPacket & {
        id?: unknown;
        studentId?: unknown;
        name?: unknown;
        program?: unknown;
        year?: unknown;
        section?: unknown;
        status?: unknown;
        requirement?: unknown;
        submittedAt?: unknown;
        proofImageUrl?: unknown;
        comment?: unknown;
        hasSubmissionCount?: unknown;
      };
      return {
        id: toStr(row.id),
        studentId: toStr(row.studentId),
        name: toStr(row.name),
        program: toStr(row.program),
        year: toStr(row.year) || "1st Year",
        section: toStr(row.section) || "A",
        status: toStr(row.status) || "Not Cleared",
        requirement: toStr(row.requirement),
        submittedAt: toStr(row.submittedAt) || "N/A",
        proofImageUrl: toStr(row.proofImageUrl),
        comment: toStr(row.comment),
        hasSubmission: Number(row.hasSubmissionCount) > 0,
      };
    });

    return NextResponse.json({ success: true, statuses: formattedRows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load student status";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    await db.end();
  }
}
