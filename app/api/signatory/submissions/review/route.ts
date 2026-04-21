import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createConnection } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const payload = await verifyToken(token) as any;
    if (!payload || payload.role !== "signatory") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { submissionIds, status } = await request.json();

    if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
        return NextResponse.json({ error: "No submissions selected" }, { status: 400 });
    }

    if (!["approved", "rejected"].includes(status.toLowerCase())) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const db = await createConnection();

    const [sig]: any = await db.query(
        "SELECT signatory_id FROM signatories WHERE user_id = ?",
        [payload.user_id]
    );
    if (sig.length === 0) return NextResponse.json({ error: "Signatory profile not found" }, { status: 404 });
    const signatory_id = sig[0].signatory_id;

    const placeholders = submissionIds.map(() => '?').join(',');

    // Step 1: Try to UPDATE existing approval rows
    const [updateResult]: any = await db.query(`
        UPDATE approvals 
        SET decision_status = ?, remarks = NULL 
        WHERE submission_id IN (${placeholders}) AND signatory_id = ?
    `, [status.toLowerCase(), ...submissionIds, signatory_id]);

    // Step 2: If no rows were updated (approval rows don't exist yet), INSERT them
    if (updateResult.affectedRows === 0) {
        await db.query(`
            INSERT INTO approvals (submission_id, signatory_id, decision_status)
            SELECT sub.submission_id, req.signatory_id, ?
            FROM submissions sub
            JOIN requirements req ON sub.requirement_id = req.requirement_id
            WHERE sub.submission_id IN (${placeholders}) AND req.signatory_id = ?
        `, [status.toLowerCase(), ...submissionIds, signatory_id]);
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
        [...submissionIds, signatory_id]
      );

      const isApproved = status.toLowerCase() === "approved";

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
