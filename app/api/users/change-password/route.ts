import { verifySessionFromCookies } from "@/lib/requestSession";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isTrustedMutationOrigin, type AuthTokenPayload } from "@/lib/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/passwordPolicy";
import { createConnection } from "@/lib/db";
import { logAuthEvent } from "@/lib/authEvents";
import type { RowDataPacket } from "mysql2/promise";

/**
 * POST /api/users/change-password
 * Body: { currentPassword: string, newPassword: string }
 * Requires a valid auth cookie (any role).
 */
export async function POST(request: NextRequest) {
    if (!isTrustedMutationOrigin(request)) {
        return NextResponse.json(
            { success: false, message: "Untrusted request origin." },
            { status: 403 }
        );
    }

    const payload: AuthTokenPayload | null = await verifySessionFromCookies(request);
    if (!payload)
        return NextResponse.json({ success: false, message: "Invalid session." }, { status: 401 });

    const body = await request.json();
    const { currentPassword, newPassword } = body ?? {};

    if (
        typeof currentPassword !== "string" || !currentPassword ||
        typeof newPassword !== "string" || !newPassword
    ) {
        return NextResponse.json(
            { success: false, message: "Both current and new passwords are required." },
            { status: 400 }
        );
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
        return NextResponse.json(
            { success: false, message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
            { status: 400 }
        );
    }

    const db = await createConnection();

    try {
        type UserPasswordRow = RowDataPacket & { user_id: number; password: string };
        const [rows] = await db.query<UserPasswordRow[]>(
            "SELECT user_id, password FROM users WHERE user_id = ? LIMIT 1",
            [payload.user_id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
        }

        const user = rows[0];
        const matches = await bcrypt.compare(currentPassword, user.password);

        if (!matches) {
            return NextResponse.json(
                { success: false, message: "Current password is incorrect." },
                { status: 400 }
            );
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.query("UPDATE users SET password = ? WHERE user_id = ?", [hashed, user.user_id]);

        // Log the password-change event
        try {
            const ip =
                request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
                request.headers.get("x-real-ip") ??
                null;
            const ua = request.headers.get("user-agent") ?? null;
            await logAuthEvent(db, user.user_id, "password_changed", ip, ua);
        } catch { /* non-blocking */ }

        return NextResponse.json({ success: true, message: "Password changed successfully." });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to change password.";
        return NextResponse.json(
            { success: false, message },
            { status: 500 }
        );
    } finally {
        await db.end();
    }
}
