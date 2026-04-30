import { verifySessionFromCookies } from "@/lib/requestSession";
import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
    const payload = await verifySessionFromCookies(request) as any;
    const role = String(payload?.role ?? "").toLowerCase();
    if (!payload || role !== "student") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await createConnection();
    try {
      const [student]: any = await db.query(
          "SELECT student_id, year_level, program FROM students WHERE user_id = ?",
          [payload.user_id]
      );
      if (student.length === 0) return NextResponse.json({ error: "Student not found" }, { status: 404 });

      const student_id = student[0].student_id;
      const student_program = student[0].program;
      const year_level = Number(student[0].year_level);
      const yearMap: Record<number, string> = {
        1: "1st Year",
        2: "2nd Year",
        3: "3rd Year",
        4: "4th Year",
      };
      const studentYearLabel = yearMap[year_level] ?? null;

      const formData = await request.formData();
      const file = formData.get("file") as File;
      const requirement_id = formData.get("requirement_id") as string;
      const comment = (formData.get("comment") as string) || "";

      if (!file || !requirement_id) return NextResponse.json({ error: "File and requirement are required" }, { status: 400 });

      const [requirementRows]: any = await db.query(
          `SELECT r.requirement_type, r.allow_file_upload, r.allow_comment, cp.period_id, sg.department, sg.assigned_program
           FROM requirements r
           JOIN clearance_periods cp ON r.period_id = cp.period_id
           JOIN signatories sg ON r.signatory_id = sg.signatory_id
           WHERE r.requirement_id = ?
             AND cp.period_status = 'live'
             AND COALESCE(r.req_status, 'active') = 'active'
             AND (r.target_year = 'All Years' OR r.target_year = ?)
           LIMIT 1`,
          [requirement_id, studentYearLabel ?? "All Years"]
      );
      const requirement = requirementRows?.[0];
      if (!requirement) {
          return NextResponse.json({ error: "Requirement not found." }, { status: 404 });
      }

      const allowUpload = Boolean(requirement.allow_file_upload);
      const allowComment = Boolean(requirement.allow_comment);

      const sigDepartment = String(requirement.department || "").toLowerCase();
      if (sigDepartment.includes("dean") && requirement.assigned_program) {
          if (requirement.assigned_program !== student_program) {
              return NextResponse.json(
                  { error: "You cannot submit to a Dean of a different program." },
                  { status: 403 }
              );
          }
      }

      if (!allowUpload) {
          return NextResponse.json(
              { error: "Upload is disabled for this requirement." },
              { status: 403 }
          );
      }

      if (!allowComment && comment.trim().length > 0) {
          return NextResponse.json(
              { error: "Comments are disabled for this requirement." },
              { status: 403 }
          );
      }

      const fileType = (file.type || "").toLowerCase();
      const isAllowedFileType = fileType.startsWith("image/") || fileType === "application/pdf";
      if (!isAllowedFileType) {
          return NextResponse.json({ error: "Only image or PDF files are allowed." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Cloudinary Upload
      const base64Data = buffer.toString("base64");
      const fileUri = `data:${fileType};base64,${base64Data}`;

      const uploadResponse = await cloudinary.uploader.upload(fileUri, {
        folder: "submissions",
        resource_type: "auto",
      });

      const publicUrl = uploadResponse.secure_url;

      const [existing]: any = await db.query(
          "SELECT submission_id FROM submissions WHERE student_id = ? AND requirement_id = ?",
          [student_id, requirement_id]
      );

      if (existing.length > 0) {
          await db.query(
              "UPDATE submissions SET file_path = ?, comment = ?, submission_date = NOW() WHERE submission_id = ?",
              [publicUrl, comment, existing[0].submission_id]
          );

          await db.query(
              "UPDATE approvals SET decision_status = 'pending', remarks = NULL WHERE submission_id = ?",
              [existing[0].submission_id]
          );
      } else {
          const [result]: any = await db.query(
              "INSERT INTO submissions (student_id, requirement_id, file_path, comment) VALUES (?, ?, ?, ?)",
              [student_id, requirement_id, publicUrl, comment]
          );

          await db.query(
              "INSERT INTO approvals (submission_id, signatory_id, decision_status) SELECT ?, r.signatory_id, 'pending' FROM requirements r WHERE r.requirement_id = ?",
              [result.insertId, requirement_id]
          );
      }

      // --- Notify the signatory who owns this requirement ---
      try {
        const [reqRows]: any = await db.query(
          `SELECT sg.user_id, req.requirement_name,
                  CONCAT(u2.first_name, ' ', u2.last_name) AS studentName
           FROM requirements req
           JOIN signatories sg ON req.signatory_id = sg.signatory_id
           JOIN students st ON st.student_id = ?
           JOIN users u2 ON st.user_id = u2.user_id
           WHERE req.requirement_id = ?`,
          [student_id, requirement_id]
        );
        if (reqRows.length > 0) {
          const { user_id: sigUserId, requirement_name, studentName } = reqRows[0];
          await createNotification({
            db,
            userId: sigUserId,
            role: "signatory",
            type: "submission_received",
            title: "📄 New Submission",
            message: `${studentName} submitted "${requirement_name}" — please review.`,
            targetId: Number(requirement_id),
            clearancePeriodId: requirement.period_id,
          });
        }
      } catch (err) {
        console.error("[Notification Error - submit]", err);
      }

      return NextResponse.json({ success: true, message: "Submitted successfully!" });
    } finally {
      await db.end();
    }
}
