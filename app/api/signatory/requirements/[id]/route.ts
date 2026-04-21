import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createConnection } from "@/lib/db";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const token = request.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

        const payload = await verifyToken(token) as any;
        if (!payload || payload.role !== "signatory") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const data = await request.json();

        const db = await createConnection();

        // Verify ownership
        const [sig]: any = await db.query(
            "SELECT signatory_id FROM signatories WHERE user_id = ?",
            [payload.user_id]
        );
    if (sig.length === 0) return NextResponse.json({ error: "Signatory profile not found" }, { status: 404 });
    const signatory_id = sig[0].signatory_id;

    await db.query(`
        UPDATE requirements SET
            requirement_name = ?, requirement_type = ?, allow_file_upload = ?, allow_comment = ?,
            description = ?, category = ?, target_year = ?,
            start_date = ?, end_date = ?, location = ?, items_to_bring = ?
        WHERE requirement_id = ? AND signatory_id = ?
    `, [
        data.title, 
        data.format?.toLowerCase() || 'digital',
        data.allowFileUpload ? 1 : 0,
        data.allowStudentNotes ? 1 : 0,
        data.description,
        data.category,
        data.targetYear,
        data.startDate || null,
        data.endDate || null,
        data.location,
        data.itemsToBring,
        id,
        signatory_id
    ]);

    return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("PUT Requirements Error:", e);
        return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const payload = await verifyToken(token) as any;
    if (!payload || payload.role !== "signatory") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = await createConnection();

    const [sig]: any = await db.query(
        "SELECT signatory_id FROM signatories WHERE user_id = ?",
        [payload.user_id]
    );
    if (sig.length === 0) return NextResponse.json({ error: "Signatory profile not found" }, { status: 404 });
    const signatory_id = sig[0].signatory_id;

    // Delete the requirement
    await db.query(`
        DELETE FROM requirements 
        WHERE requirement_id = ? AND signatory_id = ?
    `, [id, signatory_id]);

    return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("DELETE Requirements Error:", e);
        return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
    }
}
