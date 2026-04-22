import { NextRequest, NextResponse } from "next/server";
import {
    AUTH_COOKIE_NAME,
    getExpiredAuthCookieOptions,
    verifyToken,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
        return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    }

    const user = await verifyToken(token);

    if (!user) {
        const response = NextResponse.json(
            { error: "Invalid or expired token" },
            { status: 401 }
        );
        response.cookies.set(AUTH_COOKIE_NAME, "", getExpiredAuthCookieOptions());
        return response;
    }

    return NextResponse.json({ success: true, user });
}
