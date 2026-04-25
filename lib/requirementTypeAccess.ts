export type RequirementCreatorScope = "normal" | "director_sds" | "dean";

export type RequirementTypePermission = {
  scope: RequirementCreatorScope;
  canUseConditional: boolean;
};

function normalizeDepartment(input: unknown): string {
  return String(input ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function resolveRequirementTypePermission(department: unknown): RequirementTypePermission {
  const normalized = normalizeDepartment(department);
  if (normalized.includes("dean")) {
    return { scope: "dean", canUseConditional: true };
  }
  if (
    normalized.includes("director student development services") ||
    normalized.includes("director sds")
  ) {
    return { scope: "director_sds", canUseConditional: true };
  }
  return { scope: "normal", canUseConditional: false };
}

export function parseConditionalSignatoryIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0)
    )
  );
}

export function parseStoredConditionalIds(raw: unknown): number[] {
  if (raw == null) return [];
  try {
    const parsed = JSON.parse(String(raw));
    return parseConditionalSignatoryIds(parsed);
  } catch {
    return [];
  }
}

