import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  AUTH_FALLBACK_COOKIE_NAME,
  isAllowedRole,
  type UserRole,
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

/**
 * User API access matrix:
 * - Public: endpoints reachable without auth cookie (e.g. forgot-password)
 * - Authenticated-only: valid session required, any role
 * - Role-protected: enforced via PROTECTED prefix map (e.g. /api/users => admin)
 */
const PUBLIC_API_ROUTES = ["/api/users/forgot-password"] as const;
const AUTHENTICATED_ONLY = ["/api/users/change-password"] as const;

type UnauthorizedReason = "session_replaced" | "unauthorized";

function createUnauthorizedResponse(
  request: NextRequest,
  status: 401 | 403,
  reason: UnauthorizedReason = "unauthorized"
) {
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");

  if (isApiRoute) {
    return NextResponse.json(
      {
        success: false,
        message: status === 401 ? "Unauthorized." : "Forbidden.",
        reason,
      },
      { status }
    );
  }

  const destination = status === 401 ? "/login" : "/unauthorized";
  const url = new URL(destination, request.url);
  if (status === 401 && reason === "session_replaced") {
    url.searchParams.set("reason", "session-replaced");
  }
  return NextResponse.redirect(url);
}

function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
    expires: new Date(0),
  });
  response.cookies.set(AUTH_FALLBACK_COOKIE_NAME, "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
    expires: new Date(0),
  });
}

/** Confirms cookie JWT + DB session (single active session). Edge-safe via internal fetch. */
async function validateActiveSession(
  request: NextRequest
): Promise<{ role: string } | null | { reason: "session_replaced" }> {
  try {
    const res = await fetch(new URL("/api/me", request.nextUrl.origin), {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
        "x-session-check": "1",
      },
      cache: "no-store",
    });
    const data = (await res.json()) as {
      success?: boolean;
      user?: { role?: unknown };
      reason?: string;
    };
    if (!res.ok || !data.success) {
      if (data?.reason === "session_replaced") {
        return { reason: "session_replaced" };
      }
      return null;
    }
    return { role: String(data.user?.role ?? "") };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const token =
    request.cookies.get(AUTH_COOKIE_NAME)?.value ??
    request.cookies.get(AUTH_FALLBACK_COOKIE_NAME)?.value;
  const path = request.nextUrl.pathname;
  const isPublicApiRoute = PUBLIC_API_ROUTES.some((route) => path.startsWith(route));

  if (isPublicApiRoute) {
    return NextResponse.next();
  }

  const isAuthenticatedOnlyRoute = AUTHENTICATED_ONLY.some((route) => path.startsWith(route));

  if (isAuthenticatedOnlyRoute) {
    if (!token) {
      return createUnauthorizedResponse(request, 401);
    }

    const session = await validateActiveSession(request);
    if (!session || "reason" in session) {
      const response = createUnauthorizedResponse(
        request,
        401,
        session && "reason" in session ? session.reason : "unauthorized"
      );
      clearAuthCookie(response);
      return response;
    }

    return NextResponse.next();
  }

  const matchedBase = Object.keys(PROTECTED)
    .sort((a, b) => b.length - a.length)
    .find((base) => path.startsWith(base));

  if (!matchedBase) {
    return NextResponse.next();
  }

  if (!token) {
    return createUnauthorizedResponse(request, 401);
  }

  const session = await validateActiveSession(request);

  if (!session || "reason" in session) {
    const response = createUnauthorizedResponse(
      request,
      401,
      session && "reason" in session ? session.reason : "unauthorized"
    );
    clearAuthCookie(response);
    return response;
  }

  const requiredRole = PROTECTED[matchedBase];

  if (!isAllowedRole(session.role, [requiredRole])) {
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
    "/api/users/change-password",
  ],
};
