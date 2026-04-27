import { verifySessionFromCookies } from "@/lib/requestSession";
import { NextRequest, NextResponse } from "next/server";

import { createConnection } from "@/lib/db";
import { parseStoredConditionalIds, resolveRequirementTypePermission } from "@/lib/requirementTypeAccess";

export async function GET(request: NextRequest) {
    const payload = await verifySessionFromCookies(request) as any;
    const role = String(payload?.role ?? "").toLowerCase();
    if (!payload || role !== "signatory") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await createConnection();

    // Get signatory_id
    const [sig]: any = await db.query(
        "SELECT signatory_id, department FROM signatories WHERE user_id = ?",
        [payload.user_id]
    );
    if (sig.length === 0) return NextResponse.json({ error: "Signatory profile not found" }, { status: 404 });
    const signatory_id = sig[0].signatory_id;
    const permission = resolveRequirementTypePermission(sig[0].department);

    const [rows]: any = await db.query(`
        SELECT 
            sub.submission_id as id,
            CONCAT(u.first_name, ' ', u.last_name) as name,
            s.program,
            s.year_level as year,
            'A' as section,
            req.requirement_name as requirement,
            req.requirement_id as requirementId,
            COALESCE(a.decision_status, 'pending') as status,
            sub.file_path as fileUrl,
            DATE_FORMAT(sub.submission_date, '%M %d, %Y') as submittedAt,
            sub.comment as studentComment,
            a.remarks as signatoryComment
        FROM submissions sub
        JOIN students s ON sub.student_id = s.student_id
        JOIN users u ON s.user_id = u.user_id
        JOIN requirements req ON sub.requirement_id = req.requirement_id
        LEFT JOIN approvals a ON sub.submission_id = a.submission_id
        WHERE req.signatory_id = ?
        ORDER BY sub.submission_date DESC, sub.submission_id DESC
    `, [signatory_id]);

    const formattedRows = rows.map((r: any) => ({
        ...r,
        status: r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase()
    }));

    const isDirectorOrDeanScope = permission.scope === "director_sds" || permission.scope === "dean";
    let filteredRows = isDirectorOrDeanScope
      ? formattedRows.filter((row: any) => {
          const status = String(row.status).toLowerCase();
          return status === "pending" || status === "approved";
        })
      : formattedRows;

    if (isDirectorOrDeanScope) {
      const [queuedCandidates]: any = await db.query(
        `SELECT
            s.student_id AS studentId,
            CONCAT(u.first_name, ' ', u.last_name) AS name,
            s.program AS program,
            s.year_level AS year,
            'A' AS section,
            req.requirement_name AS requirement,
            req.requirement_id AS requirementId,
            req.conditional_signatory_ids AS conditionalSignatoryIdsRaw
         FROM requirements req
         JOIN clearance_periods cp
           ON cp.period_id = req.period_id
          AND cp.period_status = 'live'
         JOIN students s
           ON req.target_year = 'All Years'
           OR req.target_year = CASE s.year_level
             WHEN 1 THEN '1st Year'
             WHEN 2 THEN '2nd Year'
             WHEN 3 THEN '3rd Year'
             WHEN 4 THEN '4th Year'
             ELSE 'All Years'
           END
         JOIN users u
           ON u.user_id = s.user_id
          AND LOWER(COALESCE(NULLIF(TRIM(u.account_status), ''), 'active')) = 'active'
         LEFT JOIN submissions sub
           ON sub.requirement_id = req.requirement_id
          AND sub.student_id = s.student_id
         WHERE req.signatory_id = ?
           AND LOWER(req.requirement_type) = 'conditional'
           AND COALESCE(req.req_status, 'active') = 'active'
           AND sub.submission_id IS NULL`,
        [signatory_id]
      );

      if (queuedCandidates.length > 0) {
        const studentIds = Array.from(
          new Set(
            queuedCandidates
              .map((row: any) => Number(row.studentId))
              .filter((id: number) => Number.isInteger(id))
          )
        );

        const approvedMap = new Map<number, Set<number>>();
        if (studentIds.length > 0) {
          const placeholders = studentIds.map(() => "?").join(",");
          const [approvedRows]: any = await db.query(
            `SELECT DISTINCT
                sub.student_id AS studentId,
                req.signatory_id AS signatoryId
             FROM submissions sub
             JOIN requirements req ON req.requirement_id = sub.requirement_id
             JOIN clearance_periods cp ON cp.period_id = req.period_id
             JOIN approvals a
               ON a.submission_id = sub.submission_id
              AND a.signatory_id = req.signatory_id
             WHERE cp.period_status = 'live'
               AND sub.student_id IN (${placeholders})
               AND LOWER(a.decision_status) = 'approved'`,
            studentIds
          );
          for (const row of approvedRows) {
            const studentId = Number(row.studentId);
            const depId = Number(row.signatoryId);
            if (!approvedMap.has(studentId)) approvedMap.set(studentId, new Set<number>());
            approvedMap.get(studentId)!.add(depId);
          }
        }

        const queuedRows = queuedCandidates.map((row: any) => {
          const studentId = Number(row.studentId);
          const dependencyIds = parseStoredConditionalIds(row.conditionalSignatoryIdsRaw);
          const approvedForStudent = approvedMap.get(studentId) ?? new Set<number>();
          const isAutoApproved =
            dependencyIds.length > 0 &&
            dependencyIds.every((depId) => approvedForStudent.has(depId));

          return {
            id: `queued-${studentId}-${row.requirementId}`,
            name: row.name,
            program: row.program,
            year: row.year,
            section: row.section,
            requirement: row.requirement,
            requirementId: row.requirementId,
            status: isAutoApproved ? "Approved" : "Pending",
            fileUrl: "",
            submittedAt: "",
            studentComment: null,
            signatoryComment: isAutoApproved
              ? "Queued requirement marked approved by dependency checks."
              : "Pending (Queuing): waiting for required signatory approvals.",
          };
        });

        filteredRows = [...filteredRows, ...queuedRows];
      }
    }

    return NextResponse.json({ success: true, submissions: filteredRows });
}
