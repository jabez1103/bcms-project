import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import { verifySessionFromCookies } from "@/lib/requestSession";
import {
  addSystemLogDb,
  cleanupSystemLogsOlderThanDaysDb,
  fetchSystemLogsDb,
  type SystemLogType,
} from "@/lib/systemLogs";

function parsePositiveNumber(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

export async function GET(request: NextRequest) {
  const payload = await verifySessionFromCookies(request);
  if (!payload || String(payload.role).toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = parsePositiveNumber(url.searchParams.get("limit"), 100);
  const cleanupOlderThanDays = parsePositiveNumber(
    url.searchParams.get("cleanupOlderThanDays"),
    0,
  );

  const db = await createConnection();
  try {
    let cleaned = 0;
    if (cleanupOlderThanDays > 0) {
      cleaned = await cleanupSystemLogsOlderThanDaysDb(db, cleanupOlderThanDays);
    }
    const logs = await fetchSystemLogsDb(db, limit);
    return NextResponse.json({ success: true, logs, cleaned });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch system logs";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    await db.end();
  }
}

export async function POST(request: NextRequest) {
  const payload = await verifySessionFromCookies(request);
  if (!payload || String(payload.role).toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { type?: unknown; message?: unknown };
  const type = String(body.type ?? "info").toLowerCase() as SystemLogType | string;
  const message = String(body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 });
  }

  const db = await createConnection();
  try {
    const id = await addSystemLogDb(db, { type, message });
    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Failed to add system log";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  } finally {
    await db.end();
  }
}
