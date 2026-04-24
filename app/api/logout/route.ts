import { NextRequest, NextResponse } from "next/server";
import {
    AUTH_COOKIE_NAME,
    getExpiredAuthCookieOptions,
    isTrustedMutationOrigin,
    verifyToken,
} from "@/lib/auth";
import { createConnection } from "@/lib/db";
import { logAuthEvent } from "@/lib/authEvents";

export async function POST(request: NextRequest) {
    if (!isTrustedMutationOrigin(request)) {
        return NextResponse.json(
            { success: false, message: "Untrusted request origin." },
            { status: 403 }
        );
    }

    // Read the token before we clear it so we can log who logged out
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    const response = NextResponse.json({ success: true, message: "Logged out." });
    response.cookies.set(AUTH_COOKIE_NAME, "", getExpiredAuthCookieOptions());

    // Log the logout event best-effort
    if (token) {
        try {
            const payload = await verifyToken(token) as any;
            if (payload?.user_id) {
                const db = await createConnection();
                const ip =
                    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
                    request.headers.get("x-real-ip") ??
                    null;
                const ua = request.headers.get("user-agent") ?? null;
                await logAuthEvent(db, payload.user_id, "logout", ip, ua);
                await db.end();
            }
        } catch { /* non-blocking */ }
    }

    return response;
}
