                                                                                                                                                                                                                                                import { NextRequest, NextResponse} from "next/server"
import { createConnection } from "@/lib/db.js"

// Kuhahon ang mga user gaw
export async function GET() {
    let db = await createConnection();
    const [users] = await db.query("SELECT * FROM users");
    return Response.json(users);
}

// Mag add ug mga user gaw
export async function POST(request: Request) {
    const {user_id, first_name, middle_name, last_name, email, password, role } = await request.json();

    if (!user_id || !first_name || !last_name || !email || !password || !role) {
        return NextResponse.json({error: "All fields are required!"}, {status: 400});
    }

    let db = await createConnection();
    await db.query(
        "INSERT INTO users (user_id, first_name, middle_name, last_name, email, password, role) VALUES(?, ?, ?, ?, ?, ?, ?)",
        [user_id, first_name, middle_name ?? null, last_name, email, password, role]
    );

    return NextResponse.json({success: true, message: "User created!"});
}
