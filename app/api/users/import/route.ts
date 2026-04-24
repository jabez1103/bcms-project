import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const { users } = await request.json();

  if (!Array.isArray(users) || users.length === 0)
    return NextResponse.json({ error: "No users provided" }, { status: 400 });

  const db = await createConnection();
  let imported = 0;
  const skipped: { user_id: string; name: string; reason: string }[] = [];
  const errors: string[] = [];

  for (const u of users) {
    try {
      const {
        user_id, first_name, middle_name, last_name,
        role, program, year_level, department, credentials
      } = u;

      if (!user_id || !first_name || !last_name || !role) {
        errors.push(`Row ${user_id || "?"}: Missing required fields`);
        continue;
      }

      const cleanStr = (s: string) => (s || "").trim().toLowerCase().replace(/\s+/g, "");
      const generatedEmail = `${cleanStr(first_name)}.${cleanStr(last_name)}@bisu.edu.ph`;
      const rawPassword = `${(last_name || "").replaceAll(" ", "")}${user_id}`;

      // Check duplicate by user_id
      const [byId]: any = await db.query(
        "SELECT user_id FROM users WHERE user_id = ?", [user_id]
      );
      if (byId.length > 0) {
        skipped.push({
          user_id: String(user_id),
          name: `${first_name} ${last_name}`,
          reason: `ID ${user_id} already exists`,
        });
        continue;
      }

      // Check duplicate by email
      const [byEmail]: any = await db.query(
        "SELECT user_id FROM users WHERE email = ?", [generatedEmail]
      );
      if (byEmail.length > 0) {
        skipped.push({
          user_id: String(user_id),
          name: `${first_name} ${last_name}`,
          reason: `Email ${generatedEmail} already in use`,
        });
        continue;
      }

      const hashed = await bcrypt.hash(rawPassword, 10);

      await db.query(
        "INSERT INTO users (user_id, first_name, middle_name, last_name, email, password, role) VALUES (?,?,?,?,?,?,?)",
        [user_id, first_name, middle_name || null, last_name, generatedEmail, hashed, role]
      );

      if (role === "student") {
        await db.query(
          "INSERT INTO students (user_id, program, year_level) VALUES (?,?,?)",
          [user_id, program || null, year_level || null]
        );
      } else if (role === "signatory") {
        await db.query(
          "INSERT INTO signatories (user_id, department, credentials) VALUES (?,?,?)",
          [user_id, department || null, credentials || null]
        );
      } else if (role === "admin") {
        await db.query("INSERT INTO administrators (user_id) VALUES (?)", [user_id]);
      }

      imported++;
    } catch (err: any) {
      errors.push(`Row ${u.user_id || "?"}: ${err.message}`);
    }
  }

  return NextResponse.json({ success: true, imported, skipped, errors });
}