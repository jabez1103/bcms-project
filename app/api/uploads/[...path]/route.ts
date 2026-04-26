import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const uploadStorageDirEnv = process.env.UPLOAD_STORAGE_DIR?.trim();
const localUploadsRoot = uploadStorageDirEnv || path.join(process.cwd(), "public", "uploads");

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
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
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

  try {
    const fileBuffer = await readFile(absoluteFilePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": getContentType(absoluteFilePath),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
