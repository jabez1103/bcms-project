import { verifySessionFromCookies } from "@/lib/requestSession";
import { NextRequest, NextResponse } from "next/server";

import { createConnection } from "@/lib/db";

/**
 * GET /api/student/activity-logs/recent-logs
 * Returns the student's recent submission events (submit, approve, reject).
 */
export async function GET(request: NextRequest) {
  const payload = await verifySessionFromCookies(request) as any;
  const role = String(payload?.role ?? "").toLowerCase();
  if (!payload || role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await createConnection();

  try {
    const [student]: any = await db.query(
      "SELECT student_id FROM students WHERE user_id = ?",
      [payload.user_id]
    );
    if (student.length === 0)
      return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const student_id = student[0].student_id;

    const [rows]: any = await db.query(
      `SELECT
         sub.submission_id                               AS id,
         req.requirement_id                              AS requirementId,
         req.requirement_name                            AS requirementName,
         sg.department                                   AS department,
         COALESCE(a.decision_status, 'pending')          AS decisionStatus,
         DATE_FORMAT(sub.submission_date, '%M %d, %Y %h:%i %p') AS submittedAt
       FROM submissions sub
       JOIN requirements req ON sub.requirement_id = req.requirement_id
       JOIN signatories sg   ON req.signatory_id   = sg.signatory_id
       LEFT JOIN approvals a  ON sub.submission_id  = a.submission_id
       WHERE sub.student_id = ?
       ORDER BY sub.submission_date DESC
       LIMIT 20`,
      [student_id]
    );

    const logs = rows.map((r: any) => {
      let action = "";
      let status = "pending";

      if (r.decisionStatus === "approved") {
        action = `${r.department} approved your submission for "${r.requirementName}"`;
        status = "success";
      } else if (r.decisionStatus === "rejected") {
        action = `${r.department} rejected your submission for "${r.requirementName}"`;
        status = "error";
      } else {
        action = `You submitted a document for ${r.department} — "${r.requirementName}"`;
        status = "pending";
      }

      return {
        id: r.id,
        requirementId: r.requirementId,
        action,
        status,
        time: r.submittedAt,
      };
    });

    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  } finally {
    await db.end();
  }
}
