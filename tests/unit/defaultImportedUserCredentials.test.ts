import { describe, expect, it } from "vitest";
import {
  defaultImportedPassword,
  generatedInstitutionalEmail,
  resolveImportEmail,
  resolveImportPassword,
} from "@/lib/defaultImportedUserCredentials";
import { MIN_PASSWORD_LENGTH } from "@/lib/passwordPolicy";

describe("defaultImportedUserCredentials", () => {
  it("default password: last name (no spaces) + id, padded to minimum length if needed", () => {
    expect(defaultImportedPassword("Dela  Cruz", "2024001")).toBe("DelaCruz2024001");
    expect(defaultImportedPassword("Dela  Cruz", "2024001").length).toBeGreaterThanOrEqual(MIN_PASSWORD_LENGTH);
    expect(defaultImportedPassword("  Smith ", "42")).toBe("Smith42");
    expect(defaultImportedPassword("Doe", "9")).toBe("Doe999");
  });

  it("generates institutional email like manual register", () => {
    expect(generatedInstitutionalEmail("Juan", "Cruz")).toBe("juan.cruz@bisu.edu.ph");
    expect(generatedInstitutionalEmail("Mary Jane", "Dela Rosa")).toBe("maryjane.delarosa@bisu.edu.ph");
  });

  it("resolveImportEmail accepts optional bisu column", () => {
    expect(resolveImportEmail("  STU001@bisu.edu.ph  ", "A", "B")).toBe("stu001@bisu.edu.ph");
    expect(resolveImportEmail("bad@gmail.com", "Juan", "Cruz")).toBe("juan.cruz@bisu.edu.ph");
  });

  it("resolveImportPassword uses column when at least minimum length", () => {
    expect(resolveImportPassword("secretpass999", "X", "1")).toBe("secretpass999");
    expect(resolveImportPassword("short", "Doe", "9")).toBe("Doe999");
  });
});
