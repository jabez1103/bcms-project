import { verifySessionFromCookies } from "@/lib/requestSession";
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";

import { createConnection } from "@/lib/db";
import {
  fetchStudentLiveRequirements,
  rollupRequirementsForExport,
} from "@/lib/studentClearanceLiveRequirements";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await verifySessionFromCookies(request) as { role?: string; user_id?: number } | null;
  if (!payload || payload.role !== "signatory") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: student_id } = await params;
  const studentId = Number(student_id);
  if (!Number.isFinite(studentId) || studentId <= 0) {
    return NextResponse.json({ error: "Invalid student id" }, { status: 400 });
  }

  const db = await createConnection();

  try {
    const [sigRows] = await db.query<RowDataPacket[]>(
      "SELECT signatory_id FROM signatories WHERE user_id = ?",
      [payload.user_id]
    );
    const sigRow = sigRows[0] as { signatory_id: number } | undefined;
    if (!sigRow) return NextResponse.json({ error: "Signatory profile not found" }, { status: 404 });

    const requirements = await fetchStudentLiveRequirements(db, studentId);

    const signatories = rollupRequirementsForExport(requirements);

    return NextResponse.json({ success: true, requirements, signatories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load clearance";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    await db.end();
  }
}
