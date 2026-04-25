import { NextRequest, NextResponse } from "next/server";
import {
    AUTH_COOKIE_NAME,
    AUTH_FALLBACK_COOKIE_NAME,
    getExpiredAuthCookieOptions,
    isTrustedMutationOrigin,
    verifyToken,
} from "@/lib/auth";
import { createConnection } from "@/lib/db";
import { ensureUsersSessionTokenColumn } from "@/lib/ensureSessionTokenColumn";
import { logAuthEvent } from "@/lib/authEvents";
import type { AuthTokenPayload } from "@/lib/auth";

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
    response.cookies.set(AUTH_FALLBACK_COOKIE_NAME, "", {
        ...getExpiredAuthCookieOptions(),
        httpOnly: false,
    });

    // Log the logout event best-effort
    if (token) {
        try {
            const payload: AuthTokenPayload | null = await verifyToken(token);
            if (payload?.user_id) {
                const userId = Number(payload.user_id);
                if (!Number.isFinite(userId)) {
                    return response;
                }
                const db = await createConnection();
                try {
                    await ensureUsersSessionTokenColumn(db);
                    await db.query("UPDATE users SET session_token = NULL WHERE user_id = ?", [userId]);
                    const ip =
                        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
                        request.headers.get("x-real-ip") ??
                        null;
                    const ua = request.headers.get("user-agent") ?? null;
                    await logAuthEvent(db, userId, "logout", ip, ua);
                } finally {
                    await db.end();
                }
            }
        } catch { /* non-blocking */ }
    }

    return response;
}
