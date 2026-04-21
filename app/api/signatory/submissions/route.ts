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

    const [rows]: any = await db.query(`
        SELECT 
            sub.submission_id as id,
            CONCAT(u.first_name, ' ', u.last_name) as name,
            s.program,
            s.year_level as year,
            'A' as section,
            req.requirement_name as requirement,
            COALESCE(a.decision_status, 'pending') as status,
            sub.file_path as fileUrl,
            DATE_FORMAT(sub.submission_date, '%M %d, %Y') as submittedAt,
            sub.comment as studentComment
        FROM submissions sub
        JOIN students s ON sub.student_id = s.student_id
        JOIN users u ON s.user_id = u.user_id
        JOIN requirements req ON sub.requirement_id = req.requirement_id
        LEFT JOIN approvals a ON sub.submission_id = a.submission_id
        WHERE req.signatory_id = ?
        ORDER BY sub.submission_date DESC
    `, [signatory_id]);

    const formattedRows = rows.map((r: any) => ({
        ...r,
        status: r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase()
    }));

    return NextResponse.json({ success: true, submissions: formattedRows });
}
