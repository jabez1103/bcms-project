import { NextRequest, NextResponse} from "next/server"
import { createConnection } from "@/lib/db.js"
import bcrypt from "bcryptjs";
// Kuhahon ang mga user gaw
export async function GET() {
    let db = await createConnection();
    const [users] = await db.query("SELECT * FROM users");
    return Response.json(users);
}

// Mag add ug mga user gaw
export async function POST(request: Request) {
    const {
        user_id,
        first_name,
        middle_name,
        last_name,
        email,
        password,
        role,
        account_status,
        profile_picture,
        program,
        year_level,
        department,
    } = await request.json();

    if (!user_id || !first_name || !last_name || !email || !password || !role) {
        return NextResponse.json({error: "All fields are required!"}, {status: 400});
    }
    
    const hashedPassword = await bcrypt.hash( password, 10 );
    let db = await createConnection();

    await db.query(
        `INSERT INTO users (user_id, first_name, middle_name, last_name, email, password, role, account_status, profile_picture)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, first_name, middle_name ?? null, last_name, email, hashedPassword, role, account_status ?? "active", profile_picture]
    );

    if (role === 'student') {
        await db.query(
            `INSERT INTO students (user_id, program, year_level) VALUES (?, ?, ?)`,
            [user_id, program ?? null, year_level ?? null]
    );
    } else if (role === 'signatory') {
        await db.query(
            `INSERT INTO signatories (user_id, department) VALUES (?, ?)`,
            [user_id, department ?? null]
    );
    } else if (role === 'admin') {
        await db.query(`INSERT INTO administrators (user_id) VALUES (?)`, [user_id]);
    }

    return NextResponse.json({success: true, message: "User created!"});
}
