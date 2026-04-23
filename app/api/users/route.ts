import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createConnection } from "@/lib/db.js";
import {
  createErrorResponse,
  syncRoleRecords,
  validateUserPayload,
} from "./user-utils";

export async function GET() {
  const db = await createConnection();

  try {
    const [users] = await db.query(
      `SELECT 
        u.user_id,
        u.first_name,
        u.middle_name,
        u.last_name,
        u.email,
        u.role,
        u.account_status,
        u.profile_picture,
        s.program,
        s.year_level,
        sg.department
      FROM users u
      LEFT JOIN students s ON s.user_id = u.user_id
      LEFT JOIN signatories sg ON sg.user_id = u.user_id
      ORDER BY u.user_id DESC`,
    );

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return createErrorResponse("Failed to fetch users.", 500);
  } finally {
    await db.end();
  }
}

export async function POST(request: NextRequest) {
  const db = await createConnection();

  try {
    const body = await request.json();
    const validation = validateUserPayload(body, { requirePassword: true });

    if (!validation.valid) {
      return createErrorResponse("Please fix the highlighted fields.", 400, validation.errors);
    }

    const payload = validation.data;

    const [existingUsers]: any = await db.query(
      "SELECT user_id, email FROM users WHERE user_id = ? OR email = ? LIMIT 1",
      [payload.user_id, payload.email],
    );

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];

      if (Number(existingUser.user_id) === payload.user_id) {
        return createErrorResponse("User ID already exists.", 409, {
          user_id: "This ID is already registered.",
        });
      }

      return createErrorResponse("Email already exists.", 409, {
        email: "This institutional email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    await db.beginTransaction();

    await db.query(
      `INSERT INTO users (
        user_id,
        first_name,
        middle_name,
        last_name,
        email,
        password,
        role,
        account_status,
        profile_picture
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.user_id,
        payload.first_name,
        payload.middle_name,
        payload.last_name,
        payload.email,
        hashedPassword,
        payload.role,
        payload.account_status,
        payload.profile_picture,
      ],
    );

    await syncRoleRecords(db, payload.user_id, payload);

    await db.commit();

    return NextResponse.json(
      {
        success: true,
        message: "User account created successfully.",
      },
      { status: 201 },
    );
  } catch (error: any) {
    try {
      await db.rollback();
    } catch {}

    console.error("Failed to create user:", error);

    if (error?.code === "ER_DUP_ENTRY") {
      return createErrorResponse("User already exists.", 409);
    }

    return createErrorResponse("Failed to create user account.", 500);
  } finally {
    await db.end();
  }
}
