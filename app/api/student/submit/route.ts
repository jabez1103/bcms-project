import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createConnection } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { writeFile, mkdir } from "fs/promises";
import path from "path";


export async function POST(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const payload = await verifyToken(token) as any;
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const db = await createConnection();

    const [student]: any = await db.query(
        "SELECT student_id FROM students WHERE user_id = ?",
        [payload.user_id]
    );
    if (student.length === 0) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const student_id = student[0].student_id;

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const requirement_id = formData.get("requirement_id") as string;
    const comment = formData.get("comment") as string || "";

    if (!file || !requirement_id) return NextResponse.json({ error: "File and requirement are required" }, { status: 400 });

    if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "submissions");
    await mkdir(uploadDir, { recursive: true });

    const fileName = `submission_${student_id}_${requirement_id}_${Date.now()}${path.extname(file.name)}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/submissions/${fileName}`;

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
        });
      }
    } catch (err) {
      console.error("[Notification Error - submit]", err);
    }

    return NextResponse.json({ success: true, message: "Submitted successfully!" });
}