import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const AUTH_COOKIE_NAME = "token";
export const AUTH_ISSUER = "bcms-project";
export const AUTH_AUDIENCE = "bcms-project-app";
export const DEFAULT_JWT_TTL_SECONDS = 60 * 60 * 12;

export type UserRole = "admin" | "signatory" | "student";

export interface AuthTokenPayload extends JWTPayload {
  user_id: number | string;
  full_name: string;
  email: string;
  role: UserRole | string;
  avatar?: string | null;
  /** Matches `users.session_token` for single active session enforcement. */
  sid?: string;
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 15) {
    throw new Error("JWT_SECRET must be set and at least 15 characters long.");
  }

  return new TextEncoder().encode(secret);
}

export async function signToken(
  payload: AuthTokenPayload,
  ttlSeconds = DEFAULT_JWT_TTL_SECONDS,
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setIssuer(AUTH_ISSUER)
    .setAudience(AUTH_AUDIENCE)
    .setJti(crypto.randomUUID())
    .setExpirationTime(`${ttlSeconds}s`)
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

export function getAuthCookieOptions(maxAgeSeconds = DEFAULT_JWT_TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: maxAgeSeconds,
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

function normalizeOriginCandidate(value: string, fallbackProtocol?: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed).origin.toLowerCase();
  } catch {
    if (!fallbackProtocol) return null;
    try {
      return new URL(`${fallbackProtocol}//${trimmed}`).origin.toLowerCase();
    } catch {
      return null;
    }
  }
}

export function isTrustedMutationOrigin(request: { headers: Headers; nextUrl: URL }) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const secFetchSite = request.headers.get("sec-fetch-site");
  const expectedOrigin = request.nextUrl.origin.toLowerCase();
  const fallbackProtocol = request.nextUrl.protocol;
  const hostHeader = request.headers.get("host");
  const forwardedHostHeader = request.headers.get("x-forwarded-host");

  const trustedOrigins = new Set<string>([expectedOrigin]);
  const headerDerivedOrigins = [hostHeader, forwardedHostHeader]
    .map((entry) => normalizeOriginCandidate(entry ?? "", fallbackProtocol))
    .filter((entry): entry is string => Boolean(entry));
  for (const headerOrigin of headerDerivedOrigins) {
    trustedOrigins.add(headerOrigin);
  }
  const extraOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((entry) => normalizeOriginCandidate(entry, fallbackProtocol))
    .filter((entry): entry is string => Boolean(entry));

  for (const allowedOrigin of extraOrigins) {
    trustedOrigins.add(allowedOrigin);
  }

  if (origin) {
    const normalizedOrigin = normalizeOriginCandidate(origin, fallbackProtocol);
    return normalizedOrigin ? trustedOrigins.has(normalizedOrigin) : false;
  }

  if (referer) {
    const refererOrigin = normalizeOriginCandidate(referer);
    return refererOrigin ? trustedOrigins.has(refererOrigin) : false;
  }

  // Some browsers/dev setups may omit Origin/Referer on same-site requests.
  // In that case, allow only explicitly same-site fetch metadata.
  if (secFetchSite && ["same-origin", "same-site", "none"].includes(secFetchSite)) {
    return true;
  }

  return false;
}
