import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createConnection } from "@/lib/db";

export async function GET(request: NextRequest) {

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not logged in!" }, { status: 401 });

    const payload = await verifyToken(token) as any;
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const db = await createConnection();

    const [student]: any = await db.query(
        "SELECT student_id FROM students WHERE user_id = ?",
        [payload.user_id]
    );

    if (student.length == 0 ) {
        return NextResponse.json({ error: "Student not found" }, {status: 404 });
    }

    const student_id = student[0].student_id;

    const [rows]: any = await db.query(`
        SELECT
            r.requirement_id AS id,
            r.requirement_name AS role,
            r.description,
            CONCAT(u.first_name, ' ', u.last_name) AS name,
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
        ORDER BY r.requirement_id ASC
        `, [student_id]);

    return NextResponse.json({ success: true, signatories: rows });
}



