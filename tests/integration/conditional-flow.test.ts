import { beforeEach, describe, expect, it, vi } from "vitest";

const mockDb = {
  query: vi.fn(),
  end: vi.fn(),
};

const mockVerifySessionFromCookies = vi.fn();
const mockCreateNotification = vi.fn();

vi.mock("@/lib/db", () => ({
  createConnection: vi.fn(async () => mockDb),
}));

vi.mock("@/lib/requestSession", () => ({
  verifySessionFromCookies: (...args: unknown[]) => mockVerifySessionFromCookies(...args),
}));

vi.mock("@/lib/ensureRequirementConditionalColumns", () => ({
  ensureRequirementConditionalColumns: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/notifications", () => ({
  createNotification: (...args: unknown[]) => mockCreateNotification(...args),
}));

function makeJsonRequest(body: unknown) {
  return {
    headers: new Headers(),
    json: async () => body,
  };
}

describe("conditional requirement flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.end.mockResolvedValue(undefined);
    mockVerifySessionFromCookies.mockResolvedValue({
      user_id: 9001,
      role: "signatory",
    });
  });

  it("rejects Director SDS conditional without dependencies", async () => {
    const { POST } = await import("@/app/api/signatory/requirements/route");

    mockDb.query
      .mockResolvedValueOnce([[{ signatory_id: 77, department: "Director, Student Development Services" }]])
      .mockResolvedValueOnce([[{ period_id: 1 }]]);

    const response = await POST(
      makeJsonRequest({
        format: "Conditional",
        title: "SDS Gate",
        targetYear: "All Years",
        conditionalSignatoryIds: [],
      }) as never,
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(String(data.error)).toContain("at least one dependent signatory");
  });

  it("creates Director SDS conditional with manual_signatories policy", async () => {
    const { POST } = await import("@/app/api/signatory/requirements/route");

    mockDb.query
      .mockResolvedValueOnce([[{ signatory_id: 77, department: "Director, Student Development Services" }]])
      .mockResolvedValueOnce([[{ period_id: 1 }]])
      .mockResolvedValueOnce([{ insertId: 501 }]);

    const response = await POST(
      makeJsonRequest({
        format: "Conditional",
        title: "SDS Gate",
        targetYear: "All Years",
        conditionalSignatoryIds: [3, 4],
      }) as never,
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);

    const insertCall = mockDb.query.mock.calls.find(
      (call) => typeof call[0] === "string" && call[0].includes("INSERT INTO requirements"),
    );
    expect(insertCall).toBeTruthy();
    const params = insertCall?.[1] as unknown[];
    expect(params).toContain("manual_signatories");
    expect(params).toContain(JSON.stringify([3, 4]));
  });

  it("auto-links Dean conditional to Director SDS", async () => {
    const { POST } = await import("@/app/api/signatory/requirements/route");

    mockDb.query
      .mockResolvedValueOnce([[{ signatory_id: 88, department: "Dean" }]])
      .mockResolvedValueOnce([[{ period_id: 1 }]])
      .mockResolvedValueOnce([[{ signatory_id: 77 }]])
      .mockResolvedValueOnce([{ insertId: 601 }]);

    const response = await POST(
      makeJsonRequest({
        format: "Conditional",
        title: "Dean Gate",
        targetYear: "All Years",
      }) as never,
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);

    const insertCall = mockDb.query.mock.calls.find(
      (call) => typeof call[0] === "string" && call[0].includes("INSERT INTO requirements"),
    );
    expect(insertCall).toBeTruthy();
    const params = insertCall?.[1] as unknown[];
    expect(params).toContain("director_sds");
    expect(params).toContain(JSON.stringify([77]));
  });

  it("forbids normal signatory from creating conditional requirement", async () => {
    const { POST } = await import("@/app/api/signatory/requirements/route");

    mockDb.query
      .mockResolvedValueOnce([[{ signatory_id: 99, department: "Library" }]])
      .mockResolvedValueOnce([[{ period_id: 1 }]]);

    const response = await POST(
      makeJsonRequest({
        format: "Conditional",
        title: "Should Fail",
        targetYear: "All Years",
      }) as never,
    );

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(String(data.error)).toContain("not allowed");
  });

  it("blocks manual review for conditional submissions", async () => {
    const { POST } = await import("@/app/api/signatory/submissions/review/route");

    mockDb.query
      .mockResolvedValueOnce([[{ signatory_id: 77 }]])
      .mockResolvedValueOnce([[{ submissionId: 123 }]]);

    const response = await POST(
      makeJsonRequest({
        submissionIds: [123],
        status: "approved",
        feedback: "ok",
      }) as never,
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(String(data.error)).toContain("system-approved");
  });
});

