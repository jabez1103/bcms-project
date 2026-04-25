/**
 * Single source of truth for bulk-import credentials (CSV/Excel + `/api/users/import`).
 * Must match what admins communicate to users and what `LoginForm` validates against.
 */

import { MIN_PASSWORD_LENGTH } from "@/lib/passwordPolicy";

const BISU_EMAIL_RE = /^[a-z0-9._%+-]+@bisu\.edu\.ph$/;

/** Lowercase, no spaces — used for `firstname.lastname@bisu.edu.ph`. */
export function normalizeNameTokenForEmail(s: string): string {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

export function generatedInstitutionalEmail(firstName: string, lastName: string): string {
  return `${normalizeNameTokenForEmail(firstName)}.${normalizeNameTokenForEmail(lastName)}@bisu.edu.ph`;
}

/** Password last-name format: preserve casing from source, no spaces. */
export function normalizeLastNameTokenForPassword(lastName: string): string {
  return String(lastName ?? "")
    .trim()
    .replace(/\s+/g, "");
}

/**
 * Default password: last name (no whitespace) + user id.
 * If shorter than {@link MIN_PASSWORD_LENGTH}, append `user_id` (or last name) until long enough.
 */
export function defaultImportedPassword(lastName: string, userId: string | number): string {
  const last = normalizeLastNameTokenForPassword(lastName);
  const id = String(userId ?? "").trim();
  let base = `${last}${id}`;
  const pad = id || last || "0";
  while (base.length < MIN_PASSWORD_LENGTH) {
    base += pad;
  }
  return base;
}

/** Use explicit email from file only if it is a valid @bisu.edu.ph address. */
export function resolveImportEmail(
  rawEmail: unknown,
  firstName: string,
  lastName: string,
): string {
  if (typeof rawEmail !== "string") {
    return generatedInstitutionalEmail(firstName, lastName);
  }
  const e = rawEmail.trim().toLowerCase();
  return BISU_EMAIL_RE.test(e) ? e : generatedInstitutionalEmail(firstName, lastName);
}

/** Optional column `password`: min {@link MIN_PASSWORD_LENGTH} after trim, else default formula. */
export function resolveImportPassword(
  rawPassword: unknown,
  lastName: string,
  userId: string | number,
): string {
  if (typeof rawPassword === "string") {
    const p = rawPassword.trim();
    if (p.length >= MIN_PASSWORD_LENGTH) return p;
  }
  return defaultImportedPassword(lastName, userId);
}
