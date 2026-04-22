import { NextRequest, NextResponse } from "next/server";
import {
    AUTH_COOKIE_NAME,
    getExpiredAuthCookieOptions,
    isTrustedMutationOrigin,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
    if (!isTrustedMutationOrigin(request)) {
        return NextResponse.json(
            { success: false, message: "Untrusted request origin." },
            { status: 403 }
        );
    }

    const response = NextResponse.json({ success: true, message: "Logged out." });

    response.cookies.set(AUTH_COOKIE_NAME, "", getExpiredAuthCookieOptions());

    return response;
}
