import { createConnection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
    AUTH_COOKIE_NAME,
    getAuthCookieOptions,
    isTrustedMutationOrigin,
    signToken,
} from "@/lib/auth";
import { logAuthEvent } from "@/lib/authEvents";

export async function POST(req: NextRequest) {
    try {
        if (!isTrustedMutationOrigin(req)) {
            return NextResponse.json(
                { success: false, message: "Untrusted request origin." },
                { status: 403 }
            );
        }

        const { email, password } = await req.json();

        if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
            return NextResponse.json(
                { success: false, message: "Email and password are required." },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        const db = await createConnection();
        const [rows]: any = await db.query(
            "SELECT * FROM users WHERE email = ? LIMIT 1",
            [normalizedEmail]
        );

        const user = rows[0];

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Invalid email or password." },
                { status: 401 }
            );
        }

        if (user.account_status && String(user.account_status).toLowerCase() !== "active") {
            return NextResponse.json(
                { success: false, message: "This account is not active." },
                { status: 403 }
            );
        }

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return NextResponse.json(
                { success: false, message: "Invalid email or password." },
                { status: 401 }
            );
        }

        const token = await signToken({
            user_id: user.user_id,
            full_name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            role: user.role,
            avatar: user.profile_picture,
        });

        const response = NextResponse.json({
            success: true,
            user: {
                user_id: user.user_id,
                full_name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                role: user.role,
                avatar: user.profile_picture,
            }
        });

        response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

        // Log the login event (best-effort — don't block the response)
        try {
            const ip =
                req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
                req.headers.get("x-real-ip") ??
                null;
            const ua = req.headers.get("user-agent") ?? null;
            await logAuthEvent(db, user.user_id, "login", ip, ua);
        } catch {}

        return response;
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: error?.message || "Login failed."
            },
            { status: 500 }
        );
    }
}
