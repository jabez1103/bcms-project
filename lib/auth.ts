import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const AUTH_COOKIE_NAME = "token";
export const AUTH_ISSUER = "bcms-project";
export const AUTH_AUDIENCE = "bcms-project-app";
const JWT_TTL_SECONDS = 60 * 60 * 12;

export type UserRole = "admin" | "signatory" | "student";

export interface AuthTokenPayload extends JWTPayload {
  user_id: number | string;
  full_name: string;
  email: string;
  role: UserRole | string;
  avatar?: string | null;
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 5) {
    throw new Error("JWT_SECRET must be set and at least 32 characters long.");
  }

  return new TextEncoder().encode(secret);
}

export async function signToken(payload: AuthTokenPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setIssuer(AUTH_ISSUER)
    .setAudience(AUTH_AUDIENCE)
    .setJti(crypto.randomUUID())
    .setExpirationTime(`${JWT_TTL_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: AUTH_ISSUER,
      audience: AUTH_AUDIENCE,
    });

    if (!payload.user_id || !payload.email || !payload.role) {
      return null;
    }

    return payload as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: JWT_TTL_SECONDS,
    path: "/",
  };
}

export function getExpiredAuthCookieOptions() {
  return {
    ...getAuthCookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  };
}

export function isAllowedRole(userRole: unknown, allowedRoles: UserRole[]) {
  if (typeof userRole !== "string") {
    return false;
  }

  return allowedRoles.includes(userRole.toLowerCase() as UserRole);
}

export function isTrustedMutationOrigin(request: { headers: Headers; nextUrl: URL }) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const expectedOrigin = request.nextUrl.origin;

  if (origin) {
    return origin === expectedOrigin;
  }

  if (referer) {
    return referer.startsWith(expectedOrigin);
  }

  return false;
}
