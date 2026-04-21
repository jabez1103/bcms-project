import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createConnection } from "@/lib/db";

export async function GET(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const payload = await verifyToken(token) as any;
    if (!payload || payload.role !== "signatory") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await createConnection();

    // Get signatory_id
    const [sig]: any = await db.query(
        "SELECT signatory_id FROM signatories WHERE user_id = ?",
        [payload.user_id]
    );
    if (sig.length === 0) return NextResponse.json({ error: "Signatory profile not found" }, { status: 404 });
    const signatory_id = sig[0].signatory_id;

    try {
        const [rows]: any = await db.query(`
            SELECT 
                s.student_id as id,
                s.student_id as studentId,
                CONCAT(u.first_name, ' ', u.last_name) as name,
                s.program,
                s.year_level as year,
                'A' as section,
                CASE
                    WHEN COUNT(req.requirement_id) > 0 AND SUM(CASE WHEN a.decision_status = 'approved' THEN 1 ELSE 0 END) = COUNT(req.requirement_id) THEN 'Cleared'
                    ELSE 'Not Cleared'
                END as status,
                MAX(DATE_FORMAT(sub.submission_date, '%M %d, %Y')) as submittedAt,
                MAX(sub.file_path) as proofImageUrl,
                MAX(sub.comment) as comment,
                SUM(CASE WHEN sub.submission_id IS NOT NULL THEN 1 ELSE 0 END) as hasSubmissionCount
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            LEFT JOIN clearance_periods cp ON cp.period_status = 'live'
            LEFT JOIN requirements req ON req.period_id = cp.period_id AND req.signatory_id = ?
            LEFT JOIN submissions sub ON req.requirement_id = sub.requirement_id AND s.student_id = sub.student_id
            LEFT JOIN approvals a ON sub.submission_id = a.submission_id
            GROUP BY s.student_id, u.first_name, u.last_name, s.program, s.year_level
            ORDER BY name ASC
        `, [signatory_id]);

        const formattedRows = rows.map((r: any) => ({
            ...r,
            submittedAt: r.submittedAt || "N/A",
            proofImageUrl: r.proofImageUrl || "",
            comment: r.comment || "",
            hasSubmission: r.hasSubmissionCount > 0
        }));

        return NextResponse.json({ success: true, statuses: formattedRows });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
