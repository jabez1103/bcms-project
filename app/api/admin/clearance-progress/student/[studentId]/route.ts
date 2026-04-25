import { verifySessionFromCookies } from "@/lib/requestSession";
import { NextRequest, NextResponse } from "next/server";

import { createConnection } from "@/lib/db";
import {
  fetchStudentLiveRequirements,
  rollupRequirementsForExport,
} from "@/lib/studentClearanceLiveRequirements";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const payload = await verifySessionFromCookies(request);
  if (!payload || String(payload.role).toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studentId } = await params;
  const sid = Number(studentId);
  if (!Number.isFinite(sid) || sid <= 0) {
    return NextResponse.json({ error: "Invalid student id" }, { status: 400 });
  }

  const db = await createConnection();
  try {
    const requirements = await fetchStudentLiveRequirements(db, sid);
    const signatories = rollupRequirementsForExport(requirements);
    return NextResponse.json({ success: true, requirements, signatories });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load clearance";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    await db.end();
  }
}
