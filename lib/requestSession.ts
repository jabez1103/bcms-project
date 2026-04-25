import type { NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  AUTH_FALLBACK_COOKIE_NAME,
  verifyToken,
  type AuthTokenPayload,
} from "@/lib/auth";
import { createConnection } from "@/lib/db";
import { ensureUsersSessionTokenColumn } from "@/lib/ensureSessionTokenColumn";
import type { RowDataPacket } from "mysql2/promise";

export type SessionInvalidReason =
  | "missing_cookie"
  | "invalid_token"
  | "missing_sid"
  | "invalid_user_id"
  | "user_not_found"
  | "session_replaced";

export type SessionVerificationResult =
  | { ok: true; payload: AuthTokenPayload }
  | { ok: false; reason: SessionInvalidReason };

/**
 * Validates JWT and ensures it is still the account's active session
 * (see login route: new login overwrites `users.session_token`).
 */
export async function verifySessionTokenDetailed(token: string): Promise<SessionVerificationResult> {
  const payload = await verifyToken(token);
  if (!payload) return { ok: false, reason: "invalid_token" };

  const sid = typeof (payload as { sid?: unknown }).sid === "string" ? (payload as { sid: string }).sid : null;
  if (!sid) return { ok: false, reason: "missing_sid" };

  const userId = Number(payload.user_id);
  if (!Number.isFinite(userId)) return { ok: false, reason: "invalid_user_id" };

  const db = await createConnection();
  try {
    await ensureUsersSessionTokenColumn(db);

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT session_token FROM users WHERE user_id = ? LIMIT 1",
      [userId]
    );
    const row = rows[0] as { session_token: string | null } | undefined;
    if (!row) return { ok: false, reason: "user_not_found" };
    if (!row.session_token || row.session_token !== sid) {
      return { ok: false, reason: "session_replaced" };
    }
    return { ok: true, payload };
  } finally {
    await db.end();
  }
}

export async function verifySessionToken(token: string): Promise<AuthTokenPayload | null> {
  const result = await verifySessionTokenDetailed(token);
  return result.ok ? result.payload : null;
}

export async function verifySessionFromCookiesDetailed(
  request: NextRequest
): Promise<SessionVerificationResult> {
  const primaryToken = request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;
  const fallbackToken = request.cookies.get(AUTH_FALLBACK_COOKIE_NAME)?.value ?? null;

  if (!primaryToken && !fallbackToken) return { ok: false, reason: "missing_cookie" };

  if (primaryToken) {
    const primaryResult = await verifySessionTokenDetailed(primaryToken);
    if (primaryResult.ok) return primaryResult;
  }

  if (fallbackToken && fallbackToken !== primaryToken) {
    const fallbackResult = await verifySessionTokenDetailed(fallbackToken);
    if (fallbackResult.ok) return fallbackResult;
  }

  // If both failed, keep the primary failure reason when available.
  if (primaryToken) {
    return verifySessionTokenDetailed(primaryToken);
  }
  return verifySessionTokenDetailed(fallbackToken as string);
}

export async function verifySessionFromCookies(request: NextRequest): Promise<AuthTokenPayload | null> {
  const result = await verifySessionFromCookiesDetailed(request);
  return result.ok ? result.payload : null;
}
