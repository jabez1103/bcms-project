import { verifySessionFromCookies } from "@/lib/requestSession";
import { NextRequest, NextResponse } from "next/server";

import { createConnection } from "@/lib/db";
import { ensureRequirementConditionalColumns } from "@/lib/ensureRequirementConditionalColumns";
import {
    parseConditionalSignatoryIds,
    parseStoredConditionalIds,
    resolveRequirementTypePermission,
} from "@/lib/requirementTypeAccess";

export async function GET(request: NextRequest) {
    try {
        const payload = await verifySessionFromCookies(request) as any;
        const role = String(payload?.role ?? "").toLowerCase();
        if (!payload || role !== "signatory") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await createConnection();
        await ensureRequirementConditionalColumns(db);

        const [sig]: any = await db.query(
            "SELECT signatory_id, department FROM signatories WHERE user_id = ?",
            [payload.user_id]
        );
        if (sig.length === 0) return NextResponse.json({ error: "Signatory profile not found" }, { status: 404 });
        const signatory_id = sig[0].signatory_id;
        const signatoryDepartment = String(sig[0].department ?? "");
        const permission = resolveRequirementTypePermission(signatoryDepartment);

        const [allSignatories]: any = await db.query(
            `SELECT
                sg.signatory_id AS signatoryId,
                sg.department AS department,
                CONCAT(u.first_name, ' ', u.last_name,
                  IF(sg.academic_credentials IS NOT NULL AND sg.academic_credentials != '',
                    CONCAT(', ', sg.academic_credentials), '')) AS name
             FROM signatories sg
             JOIN users u ON sg.user_id = u.user_id
             ORDER BY sg.department ASC`
        );

        const [period]: any = await db.query(
            "SELECT period_id FROM clearance_periods WHERE period_status = 'live' ORDER BY created_at DESC LIMIT 1"
        );
        const period_id = period.length > 0 ? period[0].period_id : null;

        if (!period_id) {
            return NextResponse.json({ success: true, requirements: [] });
        }

        const [rows]: any = await db.query(`
            SELECT
                requirement_id        as id,
                requirement_name      as title,
                requirement_type      as format,
                allow_file_upload     as allowFileUpload,
                allow_comment         as allowStudentNotes,
                description,
                target_year           as targetYear,
                DATE_FORMAT(start_date, '%Y-%m-%d') as startDate,
                DATE_FORMAT(end_date,   '%Y-%m-%d') as endDate,
                location,
                items_to_bring        as itemsToBring,
                office_location       as officeLocation,
                room_number           as roomNumber,
                officer_name          as officerName,
                available_schedule    as availableSchedule,
                required_documents    as requiredDocuments,
                requirement_nature    as requirementNature,
                req_status            as reqStatus,
                conditional_signatory_ids as conditionalSignatoryIdsRaw,
                conditional_policy    as conditionalPolicy
            FROM requirements
            WHERE signatory_id = ? AND period_id = ?
            ORDER BY requirement_id DESC
        `, [signatory_id, period_id]);

        const requirements = rows.map((r: any) => ({
            ...r,
            allowFileUpload:    r.allowFileUpload  === 1,
            allowStudentNotes:  r.allowStudentNotes === 1,
            format:             r.format ? r.format.charAt(0).toUpperCase() + r.format.slice(1).toLowerCase() : "Digital",
            requirementNature:  r.requirementNature  ?? "mandatory",
            reqStatus:          r.reqStatus          ?? "active",
            conditionalSignatoryIds: parseStoredConditionalIds(r.conditionalSignatoryIdsRaw),
            conditionalPolicy: r.conditionalPolicy ?? null,
        }));

        return NextResponse.json({
            success: true,
            requirements,
            permission,
            signatoryDepartment,
            signatories: allSignatories,
        });
    } catch (e: any) {
        console.error("GET Requirements Error:", e);
        return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await verifySessionFromCookies(request) as any;
        const role = String(payload?.role ?? "").toLowerCase();
        if (!payload || role !== "signatory") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

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

        const [period]: any = await db.query(
            "SELECT period_id FROM clearance_periods WHERE period_status = 'live' ORDER BY created_at DESC LIMIT 1"
        );
        if (period.length === 0) {
            return NextResponse.json({ error: "No active clearance period found" }, { status: 400 });
        }
        const period_id = period[0].period_id;

        const normalizedFormat = String(data.format || "digital").toLowerCase();
        if (!["digital", "physical", "conditional"].includes(normalizedFormat)) {
            return NextResponse.json({ error: "Invalid requirement type." }, { status: 400 });
        }
        if (normalizedFormat === "conditional" && !permission.canUseConditional) {
            return NextResponse.json({ error: "You are not allowed to create conditional requirements." }, { status: 403 });
        }
        if (normalizedFormat !== "conditional" && !["digital", "physical"].includes(normalizedFormat)) {
            return NextResponse.json({ error: "Invalid requirement type." }, { status: 400 });
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
                const depPlaceholders = conditionalSignatoryIds.map(() => "?").join(",");
                const [dependencyRows]: any = await db.query(
                    `SELECT signatory_id AS signatoryId, department
                     FROM signatories
                     WHERE signatory_id IN (${depPlaceholders})`,
                    conditionalSignatoryIds
                );
                if (dependencyRows.length !== conditionalSignatoryIds.length) {
                    return NextResponse.json(
                        { error: "Some selected dependent signatories do not exist." },
                        { status: 400 }
                    );
                }
                const hasInvalidDependency = dependencyRows.some(
                    (row: any) => resolveRequirementTypePermission(row.department).scope !== "normal"
                );
                if (hasInvalidDependency) {
                    return NextResponse.json(
                        { error: "Dependent signatories must exclude Director SDS and Dean." },
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
                        { error: "Director SDS account is required before creating conditional requirements." },
                        { status: 400 }
                    );
                }
                conditionalSignatoryIds = [Number(directorRows[0].signatory_id)];
                conditionalPolicy = "director_sds";
            } else {
                return NextResponse.json({ error: "Conditional requirements are not allowed for this role." }, { status: 403 });
            }
        }

        const [result]: any = await db.query(`
            INSERT INTO requirements (
                requirement_name, requirement_type, allow_file_upload, allow_comment,
                signatory_id, period_id, description, target_year,
                start_date, end_date, location, items_to_bring,
                office_location, room_number, officer_name,
                available_schedule, required_documents,
                requirement_nature, req_status, conditional_signatory_ids, conditional_policy
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            data.title,
            normalizedFormat,
            allowFileUpload ? 1 : 0,
            allowStudentNotes ? 1 : 0,
            signatory_id,
            period_id,
            data.description        || null,
            data.targetYear,
            data.startDate          || null,
            data.endDate            || null,
            data.location           || null,
            data.itemsToBring       || null,
            data.officeLocation     || null,
            data.roomNumber         || null,
            data.officerName        || null,
            data.availableSchedule  || null,
            data.requiredDocuments  || null,
            data.requirementNature  || "mandatory",
            data.reqStatus          || "active",
            conditionalSignatoryIds.length > 0 ? JSON.stringify(conditionalSignatoryIds) : null,
            conditionalPolicy,
        ]);

        return NextResponse.json({ success: true, id: result.insertId });
    } catch (e: any) {
        console.error("POST Requirements Error:", e);
        return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
    }
}
