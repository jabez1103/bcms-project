import { verifySessionFromCookies } from "@/lib/requestSession";
import { NextRequest, NextResponse } from "next/server";

import { createConnection } from "@/lib/db";
import { ensureRequirementConditionalColumns } from "@/lib/ensureRequirementConditionalColumns";
import { parseConditionalSignatoryIds, resolveRequirementTypePermission } from "@/lib/requirementTypeAccess";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = await verifySessionFromCookies(request) as any;
        const role = String(payload?.role ?? "").toLowerCase();
        if (!payload || role !== "signatory") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const data = await request.json();
        const db = await createConnection();
        await ensureRequirementConditionalColumns(db);

        const [sig]: any = await db.query(
            "SELECT signatory_id, department FROM signatories WHERE user_id = ?",
            [payload.user_id]
        );
        if (sig.length === 0) return NextResponse.json({ error: "Signatory profile not found" }, { status: 404 });
        const signatory_id = sig[0].signatory_id;
        const creatorDepartment = String(sig[0].department ?? "");
        const permission = resolveRequirementTypePermission(creatorDepartment);

        const normalizedFormat = String(data.format || "digital").toLowerCase();
        if (!["digital", "physical", "conditional"].includes(normalizedFormat)) {
            return NextResponse.json({ error: "Invalid requirement type." }, { status: 400 });
        }
        if (normalizedFormat === "conditional" && !permission.canUseConditional) {
            return NextResponse.json({ error: "You are not allowed to use conditional requirements." }, { status: 403 });
        }

        let allowFileUpload = Boolean(data.allowFileUpload);
        let allowStudentNotes = allowFileUpload ? Boolean(data.allowStudentNotes) : false;
        let conditionalPolicy: "manual_signatories" | "director_sds" | null = null;
        let conditionalSignatoryIds: number[] = [];

        if (normalizedFormat === "digital") {
            allowFileUpload = true;
            allowStudentNotes = Boolean(data.allowStudentNotes);
        } else if (normalizedFormat === "physical") {
            allowFileUpload = false;
            allowStudentNotes = false;
        } else {
            allowFileUpload = false;
            allowStudentNotes = false;
            if (permission.scope === "director_sds") {
                conditionalSignatoryIds = parseConditionalSignatoryIds(data.conditionalSignatoryIds);
                if (conditionalSignatoryIds.length === 0) {
                    return NextResponse.json(
                        { error: "Conditional requirements need at least one dependent signatory." },
                        { status: 400 }
                    );
                }
                conditionalPolicy = "manual_signatories";
            } else if (permission.scope === "dean") {
                const [directorRows]: any = await db.query(
                    `SELECT signatory_id
                     FROM signatories
                     WHERE LOWER(department) LIKE '%director, student development services%'
                        OR LOWER(department) LIKE '%director sds%'
                     LIMIT 1`
                );
                if (directorRows.length === 0) {
                    return NextResponse.json(
                        { error: "Director SDS account is required before setting conditional requirements." },
                        { status: 400 }
                    );
                }
                conditionalSignatoryIds = [Number(directorRows[0].signatory_id)];
                conditionalPolicy = "director_sds";
            } else {
                return NextResponse.json({ error: "Conditional requirements are not allowed for this role." }, { status: 403 });
            }
        }

        await db.query(`
            UPDATE requirements SET
                requirement_name    = ?,
                requirement_type    = ?,
                allow_file_upload   = ?,
                allow_comment       = ?,
                description         = ?,
                target_year         = ?,
                start_date          = ?,
                end_date            = ?,
                location            = ?,
                items_to_bring      = ?,
                office_location     = ?,
                room_number         = ?,
                officer_name        = ?,
                available_schedule  = ?,
                required_documents  = ?,
                requirement_nature  = ?,
                req_status          = ?,
                conditional_signatory_ids = ?,
                conditional_policy  = ?
            WHERE requirement_id = ? AND signatory_id = ?
        `, [
            data.title,
            normalizedFormat,
            allowFileUpload ? 1 : 0,
            allowStudentNotes ? 1 : 0,
            data.description       || null,
            data.targetYear,
            data.startDate         || null,
            data.endDate           || null,
            data.location          || null,
            data.itemsToBring      || null,
            data.officeLocation    || null,
            data.roomNumber        || null,
            data.officerName       || null,
            data.availableSchedule || null,
            data.requiredDocuments || null,
            data.requirementNature || "mandatory",
            data.reqStatus         || "active",
            conditionalSignatoryIds.length > 0 ? JSON.stringify(conditionalSignatoryIds) : null,
            conditionalPolicy,
            id,
            signatory_id,
        ]);

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("PUT Requirements Error:", e);
        return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const payload = await verifySessionFromCookies(request) as any;
        const role = String(payload?.role ?? "").toLowerCase();
        if (!payload || role !== "signatory") {
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

        await db.query(
            "DELETE FROM requirements WHERE requirement_id = ? AND signatory_id = ?",
            [id, signatory_id]
        );

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("DELETE Requirements Error:", e);
        return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
    }
}
