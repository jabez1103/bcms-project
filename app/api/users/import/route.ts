import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import bcrypt from "bcryptjs";
import { resolveImportEmail, resolveImportPassword } from "@/lib/defaultImportedUserCredentials";
import { MIN_PASSWORD_LENGTH } from "@/lib/passwordPolicy";
import { isTrustedMutationOrigin } from "@/lib/auth";
import { verifySessionFromCookies } from "@/lib/requestSession";

const ALLOWED_ROLES = new Set(["student", "signatory", "admin"]);
const COMPOUND_FIRST_NAME_PARTS = new Set([
  "mae",
  "may",
  "anne",
  "ann",
  "marie",
  "lyn",
  "lynn",
  "joy",
  "jay",
  "jane",
  "grace",
  "faith",
  "rose",
  "paul",
  "john",
  "mark",
  "anthony",
  "angelo",
  "michael",
  "joseph",
]);

function normalizeImportedNameParts(firstName: unknown, middleName: unknown) {
  const first = String(firstName ?? "").trim().replace(/\s+/g, " ");
  const middleRaw = String(middleName ?? "").trim().replace(/\s+/g, " ");

  if (!middleRaw) {
    return { firstName: first, middleName: null as string | null };
  }

  const middleToken = middleRaw.toLowerCase();
  const firstWordCount = first.split(" ").filter(Boolean).length;
  const middleWordCount = middleRaw.split(" ").filter(Boolean).length;

  // Preserve common two-word first names from import sheets
  // (e.g. "Aira Mae", "Rey Anthony").
  if (
    firstWordCount === 1 &&
    middleWordCount === 1 &&
    COMPOUND_FIRST_NAME_PARTS.has(middleToken)
  ) {
    return { firstName: `${first} ${middleRaw}`.trim(), middleName: null as string | null };
  }

  return { firstName: first, middleName: middleRaw };
}

export async function POST(request: NextRequest) {
  if (!isTrustedMutationOrigin(request)) {
    return NextResponse.json(
      { error: "Untrusted request origin." },
      { status: 403 }
    );
  }

  const payload = await verifySessionFromCookies(request);
  if (!payload || String(payload.role).toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { users } = await request.json();

  if (!Array.isArray(users) || users.length === 0) {
    return NextResponse.json({ error: "No users provided" }, { status: 400 });
  }

  const db = await createConnection();
  let imported = 0;
  const skipped: { user_id: string; name: string; reason: string }[] = [];
  const errors: string[] = [];

  try {
    for (const u of users) {
      try {
        const {
          user_id,
          first_name,
          middle_name,
          last_name,
          suffix,
          role,
          program,
          year_level,
          department,
          credentials,
          email: emailCol,
          password: passwordCol,
        } = u as Record<string, unknown>;

        if (!user_id || !first_name || !last_name || !role) {
          errors.push(`Row ${user_id ?? "?"}: Missing required fields`);
          continue;
        }

        const roleNorm = String(role).trim().toLowerCase();
        if (!ALLOWED_ROLES.has(roleNorm)) {
          errors.push(`Row ${user_id}: Invalid role "${role}" (use student, signatory, or admin)`);
          continue;
        }

        const normalizedNames = normalizeImportedNameParts(first_name, middle_name);
        const fn = normalizedNames.firstName;
        const ln = String(last_name).trim();
        const uidStr = String(user_id).trim();
        const uidNum = Number(uidStr);

        if (!Number.isFinite(uidNum)) {
          errors.push(`Row ${user_id}: Invalid user_id`);
          continue;
        }

        const finalEmail = resolveImportEmail(emailCol, fn, ln);
        const rawPassword = resolveImportPassword(passwordCol, ln, uidStr);
        const hashed = await bcrypt.hash(rawPassword, 10);

        const [byId] = (await db.query("SELECT user_id FROM users WHERE user_id = ?", [
          user_id,
        ])) as [{ user_id: number }[], unknown];
        if (byId.length > 0) {
          skipped.push({
            user_id: uidStr,
            name: `${fn} ${ln}`,
            reason: `ID ${user_id} already exists`,
          });
          continue;
        }

        const [byEmail] = (await db.query("SELECT user_id FROM users WHERE email = ?", [
          finalEmail,
        ])) as [{ user_id: number }[], unknown];
        if (byEmail.length > 0) {
          skipped.push({
            user_id: uidStr,
            name: `${fn} ${ln}`,
            reason: `Email ${finalEmail} already in use`,
          });
          continue;
        }

        await db.query("START TRANSACTION");
        try {
          await db.query(
            `INSERT INTO users (
              user_id, first_name, middle_name, last_name, suffix, email, password, role, account_status
            ) VALUES (?,?,?,?,?,?,?,?, 'active')`,
            [
              uidNum,
              fn,
              normalizedNames.middleName,
              ln,
              suffix ? String(suffix).trim() : null,
              finalEmail,
              hashed,
              roleNorm,
            ],
          );

          if (roleNorm === "student") {
            const yl =
              year_level === "" || year_level === null || year_level === undefined
                ? null
                : Number(year_level);
            await db.query(
              "INSERT INTO students (student_id, user_id, program, year_level) VALUES (?,?,?,?)",
              [uidNum, uidNum, program ? String(program).trim() : null, Number.isFinite(yl) ? yl : null],
            );
          } else if (roleNorm === "signatory") {
            await db.query(
              "INSERT INTO signatories (signatory_id, user_id, department, assigned_program, academic_credentials, contact_number) VALUES (?,?,?,?,?,?)",
              [
                uidNum,
                uidNum,
                department ? String(department).trim() : null,
                program ? String(program).trim().toUpperCase() : null,
                credentials ? String(credentials).trim() : null,
                null,
              ],
            );
          } else if (roleNorm === "admin") {
            await db.query("INSERT INTO administrators (admin_id, user_id) VALUES (?,?)", [uidNum, uidNum]);
          }

          await db.query("COMMIT");
          imported++;
        } catch (rowErr) {
          await db.query("ROLLBACK");
          throw rowErr;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Row ${(u as { user_id?: unknown }).user_id ?? "?"}: ${msg}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors,
      credentialNote:
        `Default login: institutional email (firstname.lastname@bisu.edu.ph unless an email column is set) ` +
        `and password = formatted last name + user ID (first letter uppercase, remaining letters lowercase, no spaces; ` +
        `if shorter than ${MIN_PASSWORD_LENGTH} characters, ` +
        `the ID is repeated until it meets the minimum). Optional columns: email (@bisu.edu.ph), ` +
        `password (at least ${MIN_PASSWORD_LENGTH} characters).`,
    });
  } finally {
    await db.end();
  }
}
