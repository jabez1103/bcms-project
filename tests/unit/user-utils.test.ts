import { describe, expect, it } from "vitest";
import { parseUserIdParam, validateUserPayload } from "@/app/api/users/user-utils";

describe("user-utils validation", () => {
  it("validates a complete student payload", () => {
    const result = validateUserPayload({
      user_id: "2026001",
      first_name: "Jane",
      middle_name: "A",
      last_name: "Doe",
      suffix: "",
      email: "jane.doe@bisu.edu.ph",
      password: "verysecure123",
      role: "student",
      account_status: "active",
      profile_picture: "",
      program: "BSIT",
      year_level: "2",
      department: "",
      credentials: "",
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.role).toBe("student");
      expect(result.data.program).toBe("BSIT");
      expect(result.data.year_level).toBe(2);
    }
  });

  it("rejects invalid institutional email", () => {
    const result = validateUserPayload({
      user_id: "2026002",
      first_name: "John",
      last_name: "Smith",
      email: "john@gmail.com",
      password: "verysecure123",
      role: "admin",
      account_status: "active",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.email).toContain("@bisu.edu.ph");
    }
  });

  it("requires program and year level for students", () => {
    const result = validateUserPayload({
      user_id: "2026003",
      first_name: "Ana",
      last_name: "Reyes",
      email: "ana.reyes@bisu.edu.ph",
      password: "verysecure123",
      role: "student",
      account_status: "active",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.program).toBeDefined();
      expect(result.errors.year_level).toBeDefined();
    }
  });

  it("parses numeric user id params", () => {
    expect(parseUserIdParam("12345")).toBe(12345);
    expect(parseUserIdParam("abc")).toBeNull();
  });
});
