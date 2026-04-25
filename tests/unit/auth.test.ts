import { describe, expect, it, beforeEach } from "vitest";
import {
  AUTH_AUDIENCE,
  AUTH_ISSUER,
  isAllowedRole,
  isTrustedMutationOrigin,
  signToken,
  verifyToken,
} from "@/lib/auth";

describe("lib/auth", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "12345678901234567890123456789012";
  });

  it("signs and verifies a valid token payload", async () => {
    const token = await signToken({
      user_id: 1001,
      full_name: "Test User",
      email: "test@bisu.edu.ph",
      role: "admin",
      avatar: null,
      iss: AUTH_ISSUER,
      aud: AUTH_AUDIENCE,
    });

    const payload = await verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.user_id).toBe(1001);
    expect(payload?.email).toBe("test@bisu.edu.ph");
    expect(payload?.role).toBe("admin");
  });

  it("returns null for an invalid token", async () => {
    const payload = await verifyToken("not-a-valid-token");
    expect(payload).toBeNull();
  });

  it("matches allowed roles case-insensitively", () => {
    expect(isAllowedRole("ADMIN", ["admin"])).toBe(true);
    expect(isAllowedRole("student", ["admin"])).toBe(false);
  });

  it("validates trusted mutation origin from origin header", () => {
    const request = {
      headers: new Headers({ origin: "http://localhost:3000" }),
      nextUrl: new URL("http://localhost:3000/api/login"),
    };

    expect(isTrustedMutationOrigin(request)).toBe(true);
  });

  it("rejects untrusted mutation origin", () => {
    const request = {
      headers: new Headers({ origin: "https://evil.example" }),
      nextUrl: new URL("http://localhost:3000/api/login"),
    };

    expect(isTrustedMutationOrigin(request)).toBe(false);
  });
});
