import { beforeEach, describe, expect, it, vi } from "vitest";

const mockDb = {
  query: vi.fn(),
  end: vi.fn(),
  beginTransaction: vi.fn(),
  commit: vi.fn(),
  rollback: vi.fn(),
};

const mockVerifyToken = vi.fn();
const mockVerifySessionFromCookies = vi.fn();
const mockVerifySessionFromCookiesDetailed = vi.fn();
const mockSignToken = vi.fn();
const mockTrustedOrigin = vi.fn();
const mockLogAuthEvent = vi.fn();
const mockBcryptCompare = vi.fn();
const mockBcryptHash = vi.fn();

vi.mock("@/lib/db", () => ({
  createConnection: vi.fn(async () => mockDb),
}));

vi.mock("@/lib/ensureSessionTokenColumn", () => ({
  ensureUsersSessionTokenColumn: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/authEvents", () => ({
  logAuthEvent: (...args: unknown[]) => mockLogAuthEvent(...args),
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: (...args: unknown[]) => mockBcryptCompare(...args),
    hash: (...args: unknown[]) => mockBcryptHash(...args),
  },
}));

vi.mock("@/lib/auth", () => ({
  AUTH_COOKIE_NAME: "token",
  AUTH_FALLBACK_COOKIE_NAME: "token_fallback",
  getAuthCookieOptions: vi.fn(() => ({ httpOnly: true, sameSite: "lax", path: "/" })),
  getExpiredAuthCookieOptions: vi.fn(() => ({
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  })),
  isTrustedMutationOrigin: (...args: unknown[]) => mockTrustedOrigin(...args),
  verifyToken: (...args: unknown[]) => mockVerifyToken(...args),
  signToken: (...args: unknown[]) => mockSignToken(...args),
}));

vi.mock("@/lib/requestSession", () => ({
  verifySessionFromCookies: (...args: unknown[]) => mockVerifySessionFromCookies(...args),
  verifySessionFromCookiesDetailed: (...args: unknown[]) =>
    mockVerifySessionFromCookiesDetailed(...args),
}));

function makeRequest(options?: {
  cookieToken?: string;
  body?: unknown;
  origin?: string;
  referer?: string;
}) {
  const {
    cookieToken,
    body,
    origin = "http://localhost:3000",
    referer = "http://localhost:3000/login",
  } = options ?? {};

  return {
    cookies: {
      get: (name: string) => (name === "token" && cookieToken ? { value: cookieToken } : undefined),
    },
    headers: new Headers({
      origin,
      referer,
      "user-agent": "vitest",
      "x-forwarded-for": "127.0.0.1",
    }),
    nextUrl: new URL("http://localhost:3000/api/test"),
    json: async () => body ?? {},
  };
}

describe("API route integration tests (mocked DB/auth)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTrustedOrigin.mockReturnValue(true);
    mockSignToken.mockResolvedValue("signed-token");
    mockVerifyToken.mockResolvedValue({
      user_id: 1,
      role: "admin",
      email: "admin@bisu.edu.ph",
      sid: "sid-admin-1",
    });
    mockBcryptCompare.mockResolvedValue(true);
    mockBcryptHash.mockResolvedValue("hashed");
    mockVerifySessionFromCookies.mockImplementation(async (request: { cookies: { get: (n: string) => { value: string } | undefined } }) => {
      const token = request.cookies.get("token")?.value;
      if (!token) return null;
      const payload = await mockVerifyToken(token);
      if (!payload || typeof payload.sid !== "string" || payload.sid.length === 0) return null;
      return payload;
    });
    mockVerifySessionFromCookiesDetailed.mockImplementation(
      async (request: { cookies: { get: (n: string) => { value: string } | undefined } }) => {
        const token = request.cookies.get("token")?.value;
        if (!token) return { ok: false, reason: "missing_cookie" as const };
        const payload = await mockVerifyToken(token);
        if (!payload) return { ok: false, reason: "invalid_token" as const };
        if (typeof payload.sid !== "string" || payload.sid.length === 0) {
          return { ok: false, reason: "missing_sid" as const };
        }
        if (payload.sid === "replaced-session") {
          return { ok: false, reason: "session_replaced" as const };
        }
        return { ok: true, payload };
      }
    );
  });

  it("me route returns 401 with missing_cookie reason", async () => {
    const { GET } = await import("@/app/api/me/route");

    const response = await GET(makeRequest({ cookieToken: undefined }) as never);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.reason).toBe("missing_cookie");
  });

  it("me route returns 401 with missing_sid reason", async () => {
    const { GET } = await import("@/app/api/me/route");
    mockVerifyToken.mockResolvedValueOnce({ user_id: 1, role: "admin", email: "admin@bisu.edu.ph" });

    const response = await GET(makeRequest({ cookieToken: "valid-no-sid" }) as never);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.reason).toBe("missing_sid");
  });

  it("me route returns 401 with session_replaced reason", async () => {
    const { GET } = await import("@/app/api/me/route");
    mockVerifyToken.mockResolvedValueOnce({
      user_id: 1,
      role: "admin",
      email: "admin@bisu.edu.ph",
      sid: "replaced-session",
    });

    const response = await GET(makeRequest({ cookieToken: "replaced-token" }) as never);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.reason).toBe("session_replaced");
  });

  it("login route returns success and user payload", async () => {
    const { POST } = await import("@/app/api/login/route");
    mockDb.query
      .mockResolvedValueOnce([
        [
          {
            user_id: 1,
            first_name: "Admin",
            last_name: "User",
            email: "admin@bisu.edu.ph",
            password: "password123",
            role: "admin",
            profile_picture: null,
            account_status: "active",
          },
        ],
      ])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([{ insertId: 1 }]);

    const response = await POST(
      makeRequest({
        body: { email: "admin@bisu.edu.ph", password: "password123" },
      }) as never
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.user.email).toBe("admin@bisu.edu.ph");
  });

  it("login route rejects inactive accounts with explicit reason", async () => {
    const { POST } = await import("@/app/api/login/route");
    mockDb.query.mockResolvedValueOnce([
      [
        {
          user_id: 2,
          first_name: "Inactive",
          last_name: "User",
          email: "inactive@bisu.edu.ph",
          password: "password123",
          role: "student",
          profile_picture: null,
          account_status: "inactive",
        },
      ],
    ]);

    const response = await POST(
      makeRequest({
        body: { email: "inactive@bisu.edu.ph", password: "password123" },
      }) as never
    );

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.reason).toBe("account_inactive");
    expect(data.message).toContain("deactivated");
  });

  it("logout route clears session cookie", async () => {
    const { POST } = await import("@/app/api/logout/route");
    mockVerifyToken.mockResolvedValueOnce({
      user_id: 7,
      role: "student",
      email: "s@bisu.edu.ph",
      sid: "sid-student-7",
    });

    const response = await POST(makeRequest({ cookieToken: "valid-token" }) as never);
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("token=");
  });

  it("me route returns 401 for invalid token reason", async () => {
    const { GET } = await import("@/app/api/me/route");
    mockVerifyToken.mockResolvedValueOnce(null);

    const response = await GET(makeRequest({ cookieToken: "expired-token" }) as never);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.reason).toBe("invalid_token");
  });

  it("users route requires admin auth", async () => {
    const { GET } = await import("@/app/api/users/route");
    const response = await GET(makeRequest({ cookieToken: undefined }) as never);

    expect(response.status).toBe(401);
  });

  it("change-password route updates password when credentials are valid", async () => {
    const { POST } = await import("@/app/api/users/change-password/route");

    mockVerifyToken.mockResolvedValueOnce({
      user_id: 99,
      role: "student",
      email: "s@bisu.edu.ph",
      sid: "sid-student-99",
    });
    mockDb.query
      .mockResolvedValueOnce([[{ user_id: 99, password: "existing-hash" }]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{ insertId: 1 }]);

    const response = await POST(
      makeRequest({
        cookieToken: "valid-token",
        body: {
          currentPassword: "oldpassword",
          newPassword: "newpassword1234",
        },
      }) as never
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(mockBcryptHash).toHaveBeenCalled();
  });

  it("change-password route rejects session payload without sid", async () => {
    const { POST } = await import("@/app/api/users/change-password/route");
    mockVerifyToken.mockResolvedValueOnce({ user_id: 99, role: "student", email: "s@bisu.edu.ph" });

    const response = await POST(
      makeRequest({
        cookieToken: "token-without-sid",
        body: {
          currentPassword: "oldpassword",
          newPassword: "newpassword1234",
        },
      }) as never
    );

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.success).toBe(false);
  });
});
