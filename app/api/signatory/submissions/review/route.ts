import { verifySessionFromCookies } from "@/lib/requestSession";
import { NextRequest, NextResponse } from "next/server";

import { createConnection } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { ensureRequirementConditionalColumns } from "@/lib/ensureRequirementConditionalColumns";
import { parseStoredConditionalIds } from "@/lib/requirementTypeAccess";
import { resolveRequirementTypePermission } from "@/lib/requirementTypeAccess";

async function applyConditionalAutoApprovals(
  db: Awaited<ReturnType<typeof createConnection>>,
  submissionIds: number[],
) {
  if (submissionIds.length === 0) return;

  await ensureRequirementConditionalColumns(db);

  const placeholders = submissionIds.map(() => "?").join(",");
  const [studentRows]: any = await db.query(
    `SELECT DISTINCT sub.student_id AS studentId
     FROM submissions sub
     WHERE sub.submission_id IN (${placeholders})`,
    submissionIds,
  );
  const studentIds = studentRows
    .map((row: any) => Number(row.studentId))
    .filter((id: number) => Number.isInteger(id));

  if (studentIds.length === 0) return;

  const [liveRows]: any = await db.query(
    `SELECT period_id
     FROM clearance_periods
     WHERE period_status = 'live'
     ORDER BY created_at DESC
     LIMIT 1`,
  );
  if (liveRows.length === 0) return;
  const livePeriodId = Number(liveRows[0].period_id);

  const [signatoryScopeRows]: any = await db.query(
    `SELECT signatory_id AS signatoryId, department
     FROM signatories`,
  );
  const signatoryScopeMap = new Map<number, "normal" | "director_sds" | "dean">(
    signatoryScopeRows
      .map((row: any) => {
        const signatoryId = Number(row.signatoryId);
        const scope = resolveRequirementTypePermission(row.department).scope;
        return [signatoryId, scope] as const;
      })
      .filter(
        ([id]: readonly [number, "normal" | "director_sds" | "dean"]) =>
          Number.isInteger(id),
      ),
  );
  const directorSignatoryIds = new Set<number>(
    Array.from(signatoryScopeMap.entries())
      .filter(([, scope]) => scope === "director_sds")
      .map(([id]) => id),
  );

  for (const studentId of studentIds) {
    const [studentRows]: any = await db.query(
      `SELECT year_level AS yearLevel
       FROM students
       WHERE student_id = ?
       LIMIT 1`,
      [studentId],
    );
    if (studentRows.length === 0) continue;
    const yearLevel = Number(studentRows[0].yearLevel);
    const yearMap: Record<number, string> = {
      1: "1st Year",
      2: "2nd Year",
      3: "3rd Year",
      4: "4th Year",
    };
    const studentYearLabel = yearMap[yearLevel] ?? "All Years";

    const [prerequisiteRequirementRows]: any = await db.query(
      `SELECT DISTINCT signatory_id AS signatoryId
       FROM requirements
       WHERE period_id = ?
         AND COALESCE(req_status, 'active') = 'active'
         AND LOWER(requirement_type) <> 'conditional'
         AND (target_year = 'All Years' OR target_year = ?)` ,
      [livePeriodId, studentYearLabel],
    );
    const requiredInitialSignatoryIds = prerequisiteRequirementRows
      .map((row: any) => Number(row.signatoryId))
      .filter((id: number) => {
        if (!Number.isInteger(id)) return false;
        const scope = signatoryScopeMap.get(id) ?? "normal";
        return scope !== "director_sds" && scope !== "dean";
      });

    const requiredInitialSignatorySet = new Set<number>(requiredInitialSignatoryIds);

    const [allApprovedRows]: any = await db.query(
      `SELECT DISTINCT req.signatory_id AS signatoryId
       FROM submissions sub
       JOIN requirements req ON sub.requirement_id = req.requirement_id
       JOIN approvals a ON a.submission_id = sub.submission_id AND a.signatory_id = req.signatory_id
       WHERE sub.student_id = ?
         AND req.period_id = ?
         AND LOWER(a.decision_status) = 'approved'`,
      [studentId, livePeriodId],
    );
    const approvedSignatorySet = new Set<number>(
      allApprovedRows
        .map((dep: any) => Number(dep.signatoryId))
        .filter((id: number) => Number.isInteger(id)),
    );

    const [conditionalRows]: any = await db.query(
      `SELECT requirement_id AS requirementId,
              signatory_id AS signatoryId,
              conditional_signatory_ids AS conditionalSignatoryIdsRaw
       FROM requirements
       WHERE period_id = ?
         AND COALESCE(req_status, 'active') = 'active'
         AND LOWER(requirement_type) = 'conditional'`,
      [livePeriodId],
    );

    for (const row of conditionalRows) {
      const requirementOwnerSignatoryId = Number(row.signatoryId);
      const ownerScope = signatoryScopeMap.get(requirementOwnerSignatoryId) ?? "normal";
      const storedDependencyIds = parseStoredConditionalIds(row.conditionalSignatoryIdsRaw);

      let isCleared = false;

      if (ownerScope === "director_sds") {
        // Director SDS stage: requires all initial signatories (excluding Dean and Director SDS) to be approved.
        const neededIds = Array.from(requiredInitialSignatorySet);
        isCleared =
          neededIds.length > 0 &&
          neededIds.every((requiredId) => approvedSignatorySet.has(requiredId));
      } else if (ownerScope === "dean") {
        // Dean stage: requires Director SDS approval first.
        const directorDependencies =
          storedDependencyIds.length > 0
            ? storedDependencyIds.filter((id) => directorSignatoryIds.has(id))
            : Array.from(directorSignatoryIds);
        isCleared =
          directorDependencies.length > 0 &&
          directorDependencies.every((directorId) => approvedSignatorySet.has(directorId));
      } else {
        // Fallback behavior for other conditional owners.
        isCleared =
          storedDependencyIds.length > 0 &&
          storedDependencyIds.every((depId) => approvedSignatorySet.has(depId));
      }

      if (!isCleared) continue;

      const requirementId = Number(row.requirementId);
      const signatoryId = Number(row.signatoryId);

      const [existingSubmissionRows]: any = await db.query(
        `SELECT submission_id AS submissionId
         FROM submissions
         WHERE student_id = ? AND requirement_id = ?
         LIMIT 1`,
        [studentId, requirementId],
      );

      let submissionId: number;
      if (existingSubmissionRows.length > 0) {
        submissionId = Number(existingSubmissionRows[0].submissionId);
      } else {
        const [insertSubmission]: any = await db.query(
          `INSERT INTO submissions (student_id, requirement_id, file_path, comment, submission_date)
           VALUES (?, ?, '', 'Auto-approved after all required signatories cleared.', NOW())`,
          [studentId, requirementId],
        );
        submissionId = Number(insertSubmission.insertId);
      }

      const [existingApprovalRows]: any = await db.query(
        `SELECT approval_id AS approvalId
         FROM approvals
         WHERE submission_id = ? AND signatory_id = ?
         LIMIT 1`,
        [submissionId, signatoryId],
      );

      if (existingApprovalRows.length > 0) {
        await db.query(
          `UPDATE approvals
           SET decision_status = 'approved',
               remarks = 'System auto-approved after all required signatories cleared.'
           WHERE submission_id = ? AND signatory_id = ?`,
          [submissionId, signatoryId],
        );
      } else {
        await db.query(
          `INSERT INTO approvals (submission_id, signatory_id, decision_status, remarks)
           VALUES (?, ?, 'approved', 'System auto-approved after all required signatories cleared.')`,
          [submissionId, signatoryId],
        );
      }
    }
  }
}

export async function POST(request: NextRequest) {
    const payload = await verifySessionFromCookies(request) as any;
    const role = String(payload?.role ?? "").toLowerCase();
    if (!payload || role !== "signatory") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { submissionIds, status, feedback } = await request.json();

    if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
        return NextResponse.json({ error: "No submissions selected" }, { status: 400 });
    }

    const normalizedStatus = String(status || "").toLowerCase();
    if (!["approved", "rejected"].includes(normalizedStatus)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const normalizedIds = submissionIds
      .map((id: unknown) => Number(id))
      .filter((id: number) => Number.isFinite(id));
    if (normalizedIds.length === 0) {
      return NextResponse.json({ error: "No valid submissions selected" }, { status: 400 });
    }

    const normalizedFeedback =
      typeof feedback === "string" && feedback.trim().length > 0 ? feedback.trim().slice(0, 1000) : null;

    const db = await createConnection();

    const [sig]: any = await db.query(
        "SELECT signatory_id FROM signatories WHERE user_id = ?",
        [payload.user_id]
    );
    if (sig.length === 0) return NextResponse.json({ error: "Signatory profile not found" }, { status: 404 });
    const signatory_id = sig[0].signatory_id;

    const placeholders = normalizedIds.map(() => '?').join(',');
    const [conditionalRows]: any = await db.query(
      `SELECT sub.submission_id AS submissionId
       FROM submissions sub
       JOIN requirements req ON sub.requirement_id = req.requirement_id
       WHERE sub.submission_id IN (${placeholders})
         AND req.signatory_id = ?
         AND LOWER(req.requirement_type) = 'conditional'`,
      [...normalizedIds, signatory_id]
    );
    if (conditionalRows.length > 0) {
      return NextResponse.json(
        { error: "Conditional requirements are system-approved and cannot be manually reviewed." },
        { status: 400 }
      );
    }

    // Step 1: Try to UPDATE existing approval rows
    const [updateResult]: any = await db.query(`
        UPDATE approvals 
        SET decision_status = ?, remarks = ? 
        WHERE submission_id IN (${placeholders}) AND signatory_id = ?
    `, [normalizedStatus, normalizedFeedback, ...normalizedIds, signatory_id]);

    // Step 2: If no rows were updated (approval rows don't exist yet), INSERT them
    if (updateResult.affectedRows === 0) {
        await db.query(`
            INSERT INTO approvals (submission_id, signatory_id, decision_status, remarks)
            SELECT sub.submission_id, req.signatory_id, ?, ?
            FROM submissions sub
            JOIN requirements req ON sub.requirement_id = req.requirement_id
            WHERE sub.submission_id IN (${placeholders}) AND req.signatory_id = ?
        `, [normalizedStatus, normalizedFeedback, ...normalizedIds, signatory_id]);
    }

    if (normalizedStatus === "approved") {
      await applyConditionalAutoApprovals(db, normalizedIds);
    }

    // --- Notify each affected student ---
    try {
      const [affected]: any = await db.query(
        `SELECT
           st.user_id              AS studentUserId,
           req.requirement_id      AS requirementId,
           req.requirement_name    AS requirementName,
           sg.department           AS signatoryDept
         FROM submissions sub
         JOIN students st       ON sub.student_id = st.student_id
         JOIN requirements req  ON sub.requirement_id = req.requirement_id
         JOIN signatories sg    ON req.signatory_id = sg.signatory_id
         WHERE sub.submission_id IN (${placeholders}) AND req.signatory_id = ?`,
        [...normalizedIds, signatory_id]
      );

      const isApproved = normalizedStatus === "approved";

      for (const row of affected) {
        await createNotification({
          db,
          userId: row.studentUserId,
          role: "student",
          type: isApproved ? "submission_approved" : "submission_rejected",
          title: isApproved ? "✅ Requirement Approved" : "❌ Submission Rejected",
          message: isApproved
            ? `Your submission for "${row.requirementName}" was approved by ${row.signatoryDept}.`
            : `Your submission for "${row.requirementName}" was rejected by ${row.signatoryDept}. Please resubmit.`,
          targetId: row.requirementId,
        });
      }
    } catch (err) {
      console.error("[Notification Error - review]", err);
    }

    return NextResponse.json({ success: true });
}
