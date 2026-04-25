import { NextRequest, NextResponse } from "next/server";
import { verifySessionFromCookiesDetailed, verifySessionTokenDetailed } from "@/lib/requestSession";
import {
  AUTH_COOKIE_NAME,
  AUTH_FALLBACK_COOKIE_NAME,
  getAuthCookieOptions,
} from "@/lib/auth";

/**
 * Used by `proxy.ts` (Edge) to confirm the cookie still matches the DB session.
 * Not listed in the proxy matcher, so this route is not wrapped by proxy.
 */
export async function GET(request: NextRequest) {
  let result = await verifySessionFromCookiesDetailed(request);
  const bootstrapToken = request.headers.get("x-session-token");

  if (!result.ok && bootstrapToken) {
    result = await verifySessionTokenDetailed(bootstrapToken);
  }

  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 401 });
  }

  const response = NextResponse.json({
    ok: true,
    role: result.payload.role,
    user_id: result.payload.user_id,
  });

  if (bootstrapToken) {
    response.cookies.set(AUTH_COOKIE_NAME, bootstrapToken, getAuthCookieOptions());
    if (process.env.NODE_ENV !== "production") {
      response.cookies.set(AUTH_FALLBACK_COOKIE_NAME, bootstrapToken, {
        ...getAuthCookieOptions(),
        httpOnly: false,
      });
    }
  }

  return response;
}
