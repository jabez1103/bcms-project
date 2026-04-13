import { createConnection } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";


export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        let db = await createConnection();
        const [rows]: any = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        const user = rows[0];
        
        const decryptPassword = await bcrypt.compare( password, user.password)
        if (!decryptPassword) {
            return NextResponse.json({
                success: false,
                message: "Incorrect password"
            }, { status: 401 });
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

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24,
            path: "/"
        });

        return response;

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}