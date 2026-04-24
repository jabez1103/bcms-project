import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createConnection } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const payload = await verifyToken(token) as any;
    if (!payload || payload.role !== "signatory") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: student_id } = await params;

    const db = await createConnection();

    try {
        const [rows]: any = await db.query(`
            SELECT
                sg.signatory_id as id,
                sg.department AS role,
                CONCAT(u.first_name, ' ', u.last_name,
                  IF(sg.academic_credentials IS NOT NULL AND sg.academic_credentials != '',
                    CONCAT(', ', sg.academic_credentials), '')) AS name,
                CASE
                    WHEN COUNT(s.submission_id) = 0 THEN 'Not Submitted'
                    WHEN SUM(CASE WHEN a.decision_status = 'rejected' THEN 1 ELSE 0 END) > 0 THEN 'Rejected'
                    WHEN SUM(CASE WHEN a.decision_status = 'approved' THEN 1 ELSE 0 END) = COUNT(r.requirement_id) THEN 'Approved'
                    ELSE 'Pending'
                END as status
            FROM requirements r
            JOIN signatories sg ON r.signatory_id = sg.signatory_id
            JOIN users u ON sg.user_id = u.user_id
            JOIN clearance_periods cp ON r.period_id = cp.period_id
            LEFT JOIN submissions s ON s.requirement_id = r.requirement_id AND s.student_id = ?
            LEFT JOIN approvals a ON a.submission_id = s.submission_id
            WHERE cp.period_status = 'live'
            GROUP BY sg.signatory_id, sg.department, u.first_name, u.last_name, sg.academic_credentials
            ORDER BY sg.department ASC
        `, [student_id]);

        return NextResponse.json({ success: true, signatories: rows });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
