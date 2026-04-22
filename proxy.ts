import { NextRequest, NextResponse } from "next/server";
import {
    AUTH_COOKIE_NAME,
    isAllowedRole,
    type UserRole,
    verifyToken,
} from "@/lib/auth";

const PROTECTED: Record<string, UserRole> = {
    "/admin": "admin",
    "/signatory": "signatory",
    "/student": "student",
    "/api/admin": "admin",
    "/api/signatory": "signatory",
    "/api/student": "student",
    "/api/users": "admin",
};

function createUnauthorizedResponse(request: NextRequest, status: 401 | 403) {
    const isApiRoute = request.nextUrl.pathname.startsWith("/api/");

    if (isApiRoute) {
        return NextResponse.json(
            { success: false, message: status === 401 ? "Unauthorized." : "Forbidden." },
            { status }
        );
    }

    const destination = status === 401 ? "/login" : "/unauthorized";
    return NextResponse.redirect(new URL(destination, request.url));
}

export async function proxy(request: NextRequest) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const path = request.nextUrl.pathname;

    const matchedBase = Object.keys(PROTECTED)
        .sort((a, b) => b.length - a.length)
        .find((base) => path.startsWith(base));

    if (!matchedBase) {
        return NextResponse.next();
    }

    if (!token) {
        return createUnauthorizedResponse(request, 401);
    }

    const user = await verifyToken(token);

    if (!user) {
        const response = createUnauthorizedResponse(request, 401);
        response.cookies.set(AUTH_COOKIE_NAME, "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 0,
            path: "/",
            expires: new Date(0),
        });
        return response;
    }

    const requiredRole = PROTECTED[matchedBase];

    if (!isAllowedRole(user.role, [requiredRole])) {
        return createUnauthorizedResponse(request, 403);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/signatory/:path*",
        "/student/:path*",
        "/api/admin/:path*",
        "/api/signatory/:path*",
        "/api/student/:path*",
        "/api/users/:path*",
    ],
};
