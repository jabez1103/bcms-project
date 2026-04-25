import { verifySessionFromCookies } from "@/lib/requestSession";
import { NextRequest, NextResponse } from "next/server";

import { createConnection } from "@/lib/db";
import { ensureRequirementConditionalColumns } from "@/lib/ensureRequirementConditionalColumns";
import { parseStoredConditionalIds } from "@/lib/requirementTypeAccess";

export async function GET(
    request: NextRequest,
    { params } : { params: Promise<{ id:string }> }
  ) {
    const { id } = await params;

    const payload = await verifySessionFromCookies(request) as any;
    const role = String(payload?.role ?? "").toLowerCase();
    if (!payload || role !== "student") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await createConnection();
    await ensureRequirementConditionalColumns(db);

    const [student]: any = await db.query(
        "SELECT student_id, year_level FROM students WHERE user_id = ?",
        [payload.user_id]
    );
    if (student.length === 0 ) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const student_id = student[0].student_id;
    const year_level  = student[0].year_level;

    const yearMap: Record<number, string> = {
      1: "1st Year", 2: "2nd Year", 3: "3rd Year", 4: "4th Year",
    };
    const studentYearLabel = yearMap[year_level] ?? null;

    const [rows]: any = await db.query(
        `SELECT
            r.requirement_id AS id,
            r.requirement_name as role,
            r.description,
            r.requirement_type,
            r.target_year,
            r.allow_comment,
            r.allow_file_upload,
            r.office_location,
            r.room_number,
            r.available_schedule,
            r.required_documents,
            DATE_FORMAT(r.start_date, '%Y-%m-%d') AS start_date,
            DATE_FORMAT(r.end_date,   '%Y-%m-%d') AS end_date,
            CONCAT(u.first_name, ' ', u.last_name,
              IF(sg.academic_credentials IS NOT NULL AND sg.academic_credentials != '',
                CONCAT(', ', sg.academic_credentials), '')) AS signatory_name,
            u.profile_picture AS signatory_avatar,
            sg.department AS department,
            s.submission_id,
            s.file_path,
            s.comment,
            s.submission_date,
            COALESCE(a.decision_status,
                CASE WHEN s.submission_id IS NOT NULL THEN 'pending' ELSE 'not_submitted' END
            ) AS status,
            a.remarks AS signatory_feedback,
            r.conditional_signatory_ids AS conditionalSignatoryIdsRaw
        FROM requirements r
        JOIN signatories sg ON r.signatory_id = sg.signatory_id
        JOIN users u ON sg.user_id = u.user_id
        JOIN clearance_periods cp ON r.period_id = cp.period_id
        LEFT JOIN submissions s
            ON s.requirement_id = r.requirement_id AND s.student_id = ?
        LEFT JOIN approvals a
            ON a.submission_id = s.submission_id
        WHERE r.requirement_id = ?
          AND cp.period_status = 'live'
          AND COALESCE(r.req_status, 'active') = 'active'
          AND (r.target_year = 'All Years' OR r.target_year = ?)
    `, [student_id, id, studentYearLabel ?? 'All Years']);

    if (rows.length === 0) return NextResponse.json({ errro: "Requirements not found" }, { status: 404 });

    const detail = rows[0];
    if (String(detail.requirement_type ?? "").toLowerCase() === "conditional") {
      const [approvedRows]: any = await db.query(
        `SELECT DISTINCT req.signatory_id AS signatoryId
         FROM submissions sub
         JOIN requirements req ON sub.requirement_id = req.requirement_id
         JOIN clearance_periods cp ON req.period_id = cp.period_id
         JOIN approvals a ON a.submission_id = sub.submission_id AND a.signatory_id = req.signatory_id
         WHERE sub.student_id = ?
           AND cp.period_status = 'live'
           AND LOWER(a.decision_status) = 'approved'`,
        [student_id]
      );
      const approvedSignatoryIds = new Set<number>(
        approvedRows.map((r: any) => Number(r.signatoryId)).filter((n: number) => Number.isInteger(n))
      );
      const dependencyIds = parseStoredConditionalIds(detail.conditionalSignatoryIdsRaw);
      const isApproved = dependencyIds.length > 0 && dependencyIds.every((depId) => approvedSignatoryIds.has(depId));
      detail.status = isApproved ? "approved" : "pending";
    }

    return NextResponse.json({ success: true, signatory: detail });
 }