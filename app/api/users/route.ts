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
    const {user_id, first_name, middle_name, last_name, email, password, role, profile_picture } = await request.json();

    if (!user_id || !first_name || !last_name || !email || !password || !role) {
        return NextResponse.json({error: "All fields are required!"}, {status: 400});
    }
    
    const encryptPassword = await bcrypt.hash( password, 10 );
    let db = await createConnection();
    if (role === "admin") {
        await db.query(
            "INSERT INTO users (user_id, first_name, middle_name, last_name, email, password, role, profile_picture) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
            [user_id, first_name, middle_name ?? null, last_name, email, encryptPassword, role, profile_picture]
        );
        await db.query(
            "INSERT INTO administrators (admin_id, user_id) VALUES(?, ?)",
            [user_id, user_id]
        );
    } else if (role === "signatory") {
        await db.query(
            "INSERT INTO users (user_id, first_name, middle_name, last_name, email, password, role, profile_picture) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
            [user_id, first_name, middle_name ?? null, last_name, email, encryptPassword, role, profile_picture]
        );
        await db.query(
            "INSERT INTO signatories (signatory_id, user_id) VALUES(?, ?)",
            [user_id, user_id]
        );
    } else {
        await db.query(
            "INSERT INTO users (user_id, first_name, middle_name, last_name, email, password, role, profile_picture) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
            [user_id, first_name, middle_name ?? null, last_name, email, encryptPassword, role, profile_picture]
        );
        await db.query(
            "INSERT INTO students (student_id, user_id) VALUES( ?, ?)",
            [user_id, user_id]
        );
    }

    return NextResponse.json({success: true, message: "User created!"});
}
