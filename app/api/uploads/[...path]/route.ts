import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { verifySessionFromCookies } from "@/lib/requestSession";
import { createConnection } from "@/lib/db";

const uploadStorageDirEnv = process.env.UPLOAD_STORAGE_DIR?.trim();
const localUploadsRoot = uploadStorageDirEnv || path.join(process.cwd(), "storage", "uploads");

function getContentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".pdf") return "application/pdf";
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".gif") return "image/gif";
  if (extension === ".webp") return "image/webp";
  return "application/octet-stream";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const payload = await verifySessionFromCookies(request);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const segments = Array.isArray(resolvedParams.path) ? resolvedParams.path : [];
  if (segments.length === 0) {
    return NextResponse.json({ error: "Missing file path" }, { status: 400 });
  }

  const relativePath = path.normalize(segments.join("/")).replace(/^(\.\.(\/|\\|$))+/, "");
  const absoluteFilePath = path.resolve(localUploadsRoot, relativePath);
  const uploadsRootResolved = path.resolve(localUploadsRoot);

  if (!absoluteFilePath.startsWith(uploadsRootResolved)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const requestedFilePath = `/api/uploads/${relativePath.replace(/\\/g, "/")}`;
  const role = String(payload.role ?? "").toLowerCase();
  const db = await createConnection();

  try {
    const [submissionRows] = (await db.query(
      `SELECT sub.submission_id
       FROM submissions sub
       JOIN students st ON sub.student_id = st.student_id
       JOIN requirements req ON sub.requirement_id = req.requirement_id
       LEFT JOIN signatories sg ON req.signatory_id = sg.signatory_id
       WHERE sub.file_path = ?
         AND (
            ? = 'admin'
            OR (? = 'student' AND st.user_id = ?)
            OR (? = 'signatory' AND sg.user_id = ?)
         )
       LIMIT 1`,
      [requestedFilePath, role, role, payload.user_id, role, payload.user_id]
    )) as [{ submission_id: number }[], unknown];

    if (submissionRows.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = await readFile(absoluteFilePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": getContentType(absoluteFilePath),
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  } finally {
    await db.end();
  }
}
