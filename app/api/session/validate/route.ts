import { NextRequest, NextResponse } from "next/server";
import { verifySessionFromCookiesDetailed } from "@/lib/requestSession";

/**
 * Used by `proxy.ts` (Edge) to confirm the cookie still matches the DB session.
 * Not listed in the proxy matcher, so this route is not wrapped by proxy.
 */
export async function GET(request: NextRequest) {
  const result = await verifySessionFromCookiesDetailed(request);

  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    role: result.payload.role,
    user_id: result.payload.user_id,
  });
}
