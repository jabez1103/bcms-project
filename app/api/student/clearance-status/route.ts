import { verifySessionFromCookies } from "@/lib/requestSession";
import { NextRequest, NextResponse } from "next/server";

import { createConnection } from "@/lib/db";
import { ensureRequirementConditionalColumns } from "@/lib/ensureRequirementConditionalColumns";
import { ensureSignatoryAssignedProgramColumn } from "@/lib/ensureSignatoryAssignedProgramColumn";
import { parseStoredConditionalIds } from "@/lib/requirementTypeAccess";

export async function GET(request: NextRequest) {

    const payload = await verifySessionFromCookies(request) as any;
    const role = String(payload?.role ?? "").toLowerCase();
    if (!payload || role !== "student") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await createConnection();
    await ensureRequirementConditionalColumns(db);
    await ensureSignatoryAssignedProgramColumn(db);

    const [student]: any = await db.query(
        "SELECT student_id, year_level, program FROM students WHERE user_id = ?",
        [payload.user_id]
    );

    if (student.length == 0 ) {
        return NextResponse.json({ error: "Student not found" }, {status: 404 });
    }

    const student_id = student[0].student_id;
    const year_level  = student[0].year_level;  // numeric: 1, 2, 3, 4
    const student_program = student[0].program;

    // Map numeric year_level to the string stored in requirements.target_year
    const yearMap: Record<number, string> = {
      1: "1st Year",
      2: "2nd Year",
      3: "3rd Year",
      4: "4th Year",
    };
    const studentYearLabel = yearMap[year_level] ?? null;

    const [rows]: any = await db.query(`
        SELECT
            r.requirement_id AS id,
            sg.department AS role,
            r.requirement_name AS title,
            r.description,
            r.requirement_type AS format,
            CONCAT(u.first_name, ' ', u.last_name,
              IF(sg.academic_credentials IS NOT NULL AND sg.academic_credentials != '',
                CONCAT(', ', sg.academic_credentials), '')) AS name,
            r.conditional_signatory_ids AS conditionalSignatoryIdsRaw,
            COALESCE(a.decision_status,
                CASE WHEN s.submission_id IS NOT NULL THEN 'pending' ELSE 'not_submitted' END
            ) AS status
        FROM requirements r
        JOIN signatories sg ON r.signatory_id = sg.signatory_id
        JOIN users u ON sg.user_id = u.user_id
        JOIN clearance_periods cp ON r.period_id = cp.period_id
        LEFT JOIN submissions s
            ON s.requirement_id = r.requirement_id AND s.student_id = ?
        LEFT JOIN approvals a
            ON a.submission_id = s.submission_id
        WHERE cp.period_status = 'live'
          AND COALESCE(r.req_status, 'active') = 'active'
          AND (r.target_year = 'All Years' OR r.target_year = ?)
          AND (
            LOWER(sg.department) NOT LIKE '%dean%'
            OR sg.assigned_program IS NULL
            OR sg.assigned_program = ?
          )
        ORDER BY r.requirement_id ASC
        `, [student_id, studentYearLabel ?? 'All Years', student_program]);

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

    const normalizedRows = rows.map((row: any) => {
      const type = String(row.format ?? "").toLowerCase();
      if (type !== "conditional") return row;
      
      // If the backend already auto-approved it and saved it in the database, respect it!
      if (String(row.status).toLowerCase() === "approved") {
        return row;
      }
      
      // Otherwise, conditional requirements are always 'pending' (waiting for auto-approval)
      return {
        ...row,
        status: "pending",
      };
    });

    return NextResponse.json({ success: true, signatories: normalizedRows });
}



