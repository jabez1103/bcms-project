import { verifySessionFromCookies } from "@/lib/requestSession";
import { NextRequest, NextResponse } from "next/server";

import { createConnection } from "@/lib/db";
import { resolveRequirementTypePermission } from "@/lib/requirementTypeAccess";

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
    const filteredRows = isDirectorOrDeanScope
      ? formattedRows.filter((row: any) => {
          const status = String(row.status).toLowerCase();
          return status === "pending" || status === "approved";
        })
      : formattedRows;

    return NextResponse.json({ success: true, submissions: filteredRows });
}
