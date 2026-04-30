import { NextResponse } from "next/server";
import { MIN_PASSWORD_LENGTH } from "@/lib/passwordPolicy";
import type { Connection } from "mysql2/promise";

export const PROGRAMS: Record<string, number> = {
  BSIT: 4,
  BSCS: 4,
  BSES: 4,
  BEED: 4,
  BEEDMATH: 4,
  BTLED: 4,
  HM: 2,
};

export const DEPARTMENTS = [
  'Director, Scholarship and Admission',
  'Director, Guidance and Counseling Services',
  'Director, Sports Development',
  'Head, Housing and Residental Services',
  'Head, Student Publication',
  'Head, Student Goverment',
  'Head, Student Discipline',
  'Director, Health and Wellness Services',
  'Diretor, Culture and Arts Affair',
  'Director, Alumni Relations',
  'Head, Student Organizations',
  'Head, FSTLP',
  'Director, Student Development Services',
  'Sports Office',
  'Dean',
  'Librarian',
  'Cashier',
] as const;

export const VALID_ROLES = ["student", "signatory", "admin"] as const;
export const VALID_ACCOUNT_STATUSES = ["active", "inactive"] as const;

const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]*$/;

type ValidationOptions = {
  requirePassword?: boolean;
};

export type ValidatedUserPayload = {
  user_id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  email: string;
  password: string;
  role: (typeof VALID_ROLES)[number];
  account_status: (typeof VALID_ACCOUNT_STATUSES)[number];
  profile_picture: string | null;
  program: string | null;
  year_level: number | null;
  department: string | null;
  credentials: string | null;
};

function toTrimmedString(value: unknown) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function normalizeName(value: unknown) {
  return toTrimmedString(value).replace(/\s+/g, " ");
}

function normalizeOptionalText(value: unknown) {
  const normalized = toTrimmedString(value).replace(/\s+/g, " ");
  return normalized || null;
}

function normalizeEmail(value: unknown) {
  return toTrimmedString(value).toLowerCase();
}

function isValidName(value: string) {
  return NAME_REGEX.test(value);
}

export function createErrorResponse(
  error: string,
  status = 400,
  details?: Record<string, string>,
) {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details ? { details } : {}),
    },
    { status },
  );
}

export function validateUserPayload(
  input: unknown,
  { requirePassword = true }: ValidationOptions = {},
):
  | { valid: true; data: ValidatedUserPayload }
  | { valid: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const source: Record<string, unknown> =
    typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};

  const userIdRaw = toTrimmedString(source.user_id);
  const first_name = normalizeName(source.first_name);
  const middle_name = normalizeOptionalText(source.middle_name);
  const last_name = normalizeName(source.last_name);
  const suffix = normalizeOptionalText(source.suffix);
  const email = normalizeEmail(source.email);
  const password = toTrimmedString(source.password);
  const role = toTrimmedString(source.role).toLowerCase();
  const account_status = toTrimmedString(source.account_status).toLowerCase() || "active";
  const profile_picture = normalizeOptionalText(source.profile_picture) || "/avatars/defaultAvatar.jpg";
  const program = toTrimmedString(source.program).toUpperCase();
  const yearLevelRaw = toTrimmedString(source.year_level);
  const department = normalizeOptionalText(source.department);
  const credentials = normalizeOptionalText(source.credentials);

  if (!userIdRaw) {
    errors.user_id = "User ID is required.";
  } else if (!/^\d+$/.test(userIdRaw)) {
    errors.user_id = "User ID must contain numbers only.";
  }

  if (!first_name) {
    errors.first_name = "First name is required.";
  } else if (!isValidName(first_name)) {
    errors.first_name = "First name contains invalid characters.";
  }

  if (middle_name && !isValidName(middle_name)) {
    errors.middle_name = "Middle name contains invalid characters.";
  }

  if (!last_name) {
    errors.last_name = "Last name is required.";
  } else if (!isValidName(last_name)) {
    errors.last_name = "Last name contains invalid characters.";
  }

  if (suffix && !isValidName(suffix)) {
    errors.suffix = "Suffix contains invalid characters.";
  }

  if (!email) {
    errors.email = "Institutional email is required.";
  } else if (!/^[a-z0-9._%+-]+@bisu\.edu\.ph$/.test(email)) {
    errors.email = "Email must use the @bisu.edu.ph domain.";
  }

  if (requirePassword) {
    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
  } else if (password && password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
    errors.role = "Please select a valid role.";
  }

  if (
    !VALID_ACCOUNT_STATUSES.includes(
      account_status as (typeof VALID_ACCOUNT_STATUSES)[number],
    )
  ) {
    errors.account_status = "Please select a valid account status.";
  }

  let year_level: number | null = null;

  if (role === "student") {
    if (!program) {
      errors.program = "Program is required for student accounts.";
    } else if (!(program in PROGRAMS)) {
      errors.program = "Please select a valid program.";
    }

    if (!yearLevelRaw) {
      errors.year_level = "Year level is required for student accounts.";
    } else if (!/^\d+$/.test(yearLevelRaw)) {
      errors.year_level = "Year level must be a number.";
    } else {
      year_level = Number(yearLevelRaw);
      const maxYear = PROGRAMS[program];
      if (!maxYear || year_level < 1 || year_level > maxYear) {
        errors.year_level = `Year level must be between 1 and ${maxYear ?? 4}.`;
      }
    }
  }

  if (role === "signatory") {
    if (!department) {
      errors.department = "Department is required for signatory accounts.";
    } else if (!DEPARTMENTS.includes(department as (typeof DEPARTMENTS)[number])) {
      errors.department = "Please select a valid department.";
    }

    // Program is strictly mandatory for ALL signatories
    if (!program) {
      errors.program = "Program is required for all signatory accounts.";
    } else if (!(program in PROGRAMS)) {
      errors.program = "Please select a valid program.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      user_id: Number(userIdRaw),
      first_name,
      middle_name,
      last_name,
      suffix,
      email,
      password,
      role: role as (typeof VALID_ROLES)[number],
      account_status: account_status as (typeof VALID_ACCOUNT_STATUSES)[number],
      profile_picture,
      program: role === "student" ? program : role === "signatory" ? (program || null) : null,
      year_level: role === "student" ? year_level : null,
      department: role === "signatory" ? department : null,
      credentials: role === "signatory" ? credentials : null,
    },
  };
}

export function parseUserIdParam(id: string) {
  const value = toTrimmedString(id);
  if (!/^\d+$/.test(value)) {
    return null;
  }
  return Number(value);
}

export async function syncRoleRecords(
  db: Connection,
  userId: number,
  payload: Pick<
    ValidatedUserPayload,
    "role" | "program" | "year_level" | "department" | "credentials"
  > & { program?: string | null },
) {
  await db.query("DELETE FROM students WHERE user_id = ?", [userId]);
  await db.query("DELETE FROM signatories WHERE user_id = ?", [userId]);
  await db.query("DELETE FROM administrators WHERE user_id = ?", [userId]);

  if (payload.role === "student") {
    await db.query(
      "INSERT INTO students (student_id, user_id, program, year_level) VALUES (?, ?, ?, ?)",
      [userId, userId, payload.program, payload.year_level],
    );
    return;
  }

  if (payload.role === "signatory") {
    await db.query(
      "INSERT INTO signatories (signatory_id, user_id, department, assigned_program, academic_credentials, contact_number) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, userId, payload.department, payload.program || null, payload.credentials, null],
    );
    return;
  }

  await db.query(
    "INSERT INTO administrators (admin_id, user_id) VALUES (?, ?)",
    [userId, userId],
  );
}
