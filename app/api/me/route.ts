import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";


export async function GET(request: NextRequest) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    }

    const user = await verifyToken(token);

    if (!user) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    return NextResponse.json({ success: true, user });
}