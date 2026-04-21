import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const PROTECTED = {
    "/admin": "admin",
    "/signatory": "signatory",
    "/student": "student",
};

export async function proxy(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const path = request.nextUrl.pathname;

    const matchedBase = Object.keys(PROTECTED).find(base => path.startsWith(base));

    if (!matchedBase) return NextResponse.next();

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const user = await verifyToken(token) as any;

    if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const requiredRole = PROTECTED[matchedBase as keyof typeof PROTECTED];

    if (user.role.toLowerCase() !== requiredRole.toLowerCase()) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/signatory/:path*", "/student/:path*"],
};