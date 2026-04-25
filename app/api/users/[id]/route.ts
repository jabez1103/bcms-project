import { verifySessionFromCookies } from "@/lib/requestSession";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createConnection } from "@/lib/db";
import {
  createErrorResponse,
  parseUserIdParam,
  syncRoleRecords,
  validateUserPayload,
} from "../user-utils";
import type { RowDataPacket } from "mysql2/promise";

const SELF_PROTECTION_MESSAGE =
  "System Protection: You cannot modify your own administrative status";

async function getAdminPayload(request: NextRequest) {
  const payload = await verifySessionFromCookies(request);

  if (!payload) {
    return { response: createErrorResponse("Not logged in.", 401) } as const;
  }

  if (String(payload.role).toLowerCase() !== "admin") {
    return { response: createErrorResponse("Unauthorized.", 401) } as const;
  }

  return { payload } as const;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = parseUserIdParam(id);

  if (userId === null) {
    return createErrorResponse("Invalid user ID.", 400, {
      user_id: "The provided user ID is invalid.",
    });
  }

  const auth = await getAdminPayload(request);
  if ("response" in auth) {
    return auth.response;
  }

  if (Number(auth.payload.user_id) === userId) {
    return createErrorResponse(SELF_PROTECTION_MESSAGE, 403);
  }

  const db = await createConnection();

  try {
    const body = await request.json();
    const mergedPayload = {
      ...body,
      user_id: userId,
    };

    const validation = validateUserPayload(mergedPayload, {
      requirePassword: false,
    });

    if (!validation.valid) {
      return createErrorResponse(
        "Please fix the highlighted fields.",
        400,
        validation.errors,
      );
    }

    const payload = validation.data;

    type UserIdRow = RowDataPacket & { user_id: number };
    const [existingUsers] = await db.query<UserIdRow[]>(
      "SELECT user_id FROM users WHERE user_id = ? LIMIT 1",
      [userId],
    );

    if (existingUsers.length === 0) {
      return createErrorResponse("User not found.", 404);
    }

    const [emailConflict] = await db.query<UserIdRow[]>(
      "SELECT user_id FROM users WHERE email = ? AND user_id <> ? LIMIT 1",
      [payload.email, userId],
    );

    if (emailConflict.length > 0) {
      return createErrorResponse("Email already exists.", 409, {
        email: "This institutional email is already registered.",
      });
    }

    await db.beginTransaction();

    if (payload.password) {
      const hashedPassword = await bcrypt.hash(payload.password, 10);
      await db.query(
        `UPDATE users
         SET first_name = ?, middle_name = ?, last_name = ?, suffix = ?, email = ?,
             password = ?, role = ?, account_status = ?, profile_picture = ?
         WHERE user_id = ?`,
        [
          payload.first_name,
          payload.middle_name,
          payload.last_name,
          payload.suffix || null,
          payload.email,
          hashedPassword,
          payload.role,
          payload.account_status,
          payload.profile_picture,
          userId,
        ],
      );
    } else {
      await db.query(
        `UPDATE users
         SET first_name = ?, middle_name = ?, last_name = ?, suffix = ?, email = ?,
             role = ?, account_status = ?, profile_picture = ?
         WHERE user_id = ?`,
        [
          payload.first_name,
          payload.middle_name,
          payload.last_name,
          payload.suffix || null,
          payload.email,
          payload.role,
          payload.account_status,
          payload.profile_picture,
          userId,
        ],
      );
    }

    await syncRoleRecords(db, userId, payload);

    await db.commit();

    return NextResponse.json({
      success: true,
      message: "User account updated successfully.",
    });
  } catch (error: unknown) {
    try {
      await db.rollback();
    } catch {}

    console.error("Failed to update user:", error);
    return createErrorResponse("Failed to update user account.", 500);
  } finally {
    await db.end();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = parseUserIdParam(id);

  if (userId === null) {
    return createErrorResponse("Invalid user ID.", 400, {
      user_id: "The provided user ID is invalid.",
    });
  }

  const auth = await getAdminPayload(request);
  if ("response" in auth) {
    return auth.response;
  }

  if (Number(auth.payload.user_id) === userId) {
    return createErrorResponse(SELF_PROTECTION_MESSAGE, 403);
  }

  const db = await createConnection();

  try {
    type UserIdRow = RowDataPacket & { user_id: number };
    const [existingUsers] = await db.query<UserIdRow[]>(
      "SELECT user_id FROM users WHERE user_id = ? LIMIT 1",
      [userId],
    );

    if (existingUsers.length === 0) {
      return createErrorResponse("User not found.", 404);
    }

    await db.beginTransaction();
    await db.query("DELETE FROM students WHERE user_id = ?", [userId]);
    await db.query("DELETE FROM signatories WHERE user_id = ?", [userId]);
    await db.query("DELETE FROM administrators WHERE user_id = ?", [userId]);
    await db.query("DELETE FROM users WHERE user_id = ?", [userId]);
    await db.commit();

    return NextResponse.json({
      success: true,
      message: "User account deleted successfully.",
    });
  } catch (error: unknown) {
    try {
      await db.rollback();
    } catch {}

    console.error("Failed to delete user:", error);
    return createErrorResponse("Failed to delete user account.", 500);
  } finally {
    await db.end();
  }
}
