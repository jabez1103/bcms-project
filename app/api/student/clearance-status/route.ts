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
        "SELECT student_id, year_level FROM students WHERE user_id = ?",
        [payload.user_id]
    );

    if (student.length == 0 ) {
        return NextResponse.json({ error: "Student not found" }, {status: 404 });
    }

    const student_id = student[0].student_id;
    const year_level  = student[0].year_level;  // numeric: 1, 2, 3, 4

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
        ORDER BY r.requirement_id ASC
        `, [student_id, studentYearLabel ?? 'All Years']);

    return NextResponse.json({ success: true, signatories: rows });
}



