import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createConnection } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
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

    // Get active period
    const [period]: any = await db.query(
        "SELECT period_id FROM clearance_periods WHERE period_status = 'live' ORDER BY created_at DESC LIMIT 1"
    );
    const period_id = period.length > 0 ? period[0].period_id : null;

    if (!period_id) {
        return NextResponse.json({ success: true, requirements: [] });
    }

    const [rows]: any = await db.query(`
        SELECT 
            requirement_id as id,
            requirement_name as title,
            requirement_type as format,
            allow_file_upload as allowFileUpload,
            allow_comment as allowStudentNotes,
            description,
            category,
            target_year as targetYear,
            DATE_FORMAT(start_date, '%Y-%m-%d') as startDate,
            DATE_FORMAT(end_date, '%Y-%m-%d') as endDate,
            location,
            items_to_bring as itemsToBring
        FROM requirements 
        WHERE signatory_id = ? AND period_id = ?
        ORDER BY requirement_id DESC
    `, [signatory_id, period_id]);

    const requirements = rows.map((r: any) => ({
        ...r,
        allowFileUpload: r.allowFileUpload === 1,
        allowStudentNotes: r.allowStudentNotes === 1,
        format: r.format ? r.format.charAt(0).toUpperCase() + r.format.slice(1).toLowerCase() : "Digital"
    }));

    return NextResponse.json({ success: true, requirements });
    } catch (e: any) {
        console.error("GET Requirements Error:", e);
        return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const payload = await verifyToken(token) as any;
    if (!payload || payload.role !== "signatory") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const db = await createConnection();

    const [sig]: any = await db.query(
        "SELECT signatory_id FROM signatories WHERE user_id = ?",
        [payload.user_id]
    );
    if (sig.length === 0) return NextResponse.json({ error: "Signatory profile not found" }, { status: 404 });
    const signatory_id = sig[0].signatory_id;

    const [period]: any = await db.query(
        "SELECT period_id FROM clearance_periods WHERE period_status = 'live' ORDER BY created_at DESC LIMIT 1"
    );
    
    if (period.length === 0) {
        return NextResponse.json({ error: "No active clearance period found" }, { status: 400 });
    }
    const period_id = period[0].period_id;

    const [result]: any = await db.query(`
        INSERT INTO requirements (
            requirement_name, requirement_type, allow_file_upload, allow_comment,
            signatory_id, period_id, description, category, target_year,
            start_date, end_date, location, items_to_bring
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        data.title, 
        data.format?.toLowerCase() || 'digital',
        data.allowFileUpload ? 1 : 0,
        data.allowStudentNotes ? 1 : 0,
        signatory_id,
        period_id,
        data.description,
        data.category,
        data.targetYear,
        data.startDate || null,
        data.endDate || null,
        data.location,
        data.itemsToBring
    ]);

    return NextResponse.json({ success: true, id: result.insertId });
    } catch (e: any) {
        console.error("POST Requirements Error:", e);
        return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
    }
}
