import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyToken } from "@/lib/auth";
import { createConnection } from "@/lib/db";
import { logAuthEvent } from "@/lib/authEvents";

/**
 * POST /api/users/change-password
 * Body: { currentPassword: string, newPassword: string }
 * Requires a valid auth cookie (any role).
 */
export async function POST(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token)
        return NextResponse.json({ success: false, message: "Not logged in." }, { status: 401 });

    const payload = await verifyToken(token) as any;
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

    if (newPassword.length < 12) {
        return NextResponse.json(
            { success: false, message: "New password must be at least 6 characters." },
            { status: 400 }
        );
    }

    const db = await createConnection();

    try {
        const [rows]: any = await db.query(
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
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err.message || "Failed to change password." },
            { status: 500 }
        );
    } finally {
        await db.end();
    }
}
