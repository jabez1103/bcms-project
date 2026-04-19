import { NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> } ) {

  const { id } = await params;
  const {
    first_name,
    middle_name,
    last_name,
    email,
    password,
    role,
    account_status,
    program,
    year_level,
    department
  } = await request.json();

    let db = await createConnection();
    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
        `UPDATE users SET first_name=?, middle_name=?, last_name=?, email=?, 
        password=?, role=?, account_status=? WHERE user_id=?`,
        [first_name, middle_name ?? null, last_name, email, hashedPassword, role, account_status, id]
        );
    } else {
        await db.query(
        `UPDATE users SET first_name=?, middle_name=?, last_name=?, email=?, 
        role=?, account_status=? WHERE user_id=?`,
        [first_name, middle_name ?? null, last_name, email, role, account_status, id]
        );
    }

    if (role === "student") {
        const [existing]: any = await db.query(
        "SELECT student_id FROM students WHERE user_id = ?", [id]
    );
        if (existing.length > 0) {
            await db.query(
                "UPDATE students SET program=?, year_level=? WHERE user_id=?",
                [program ?? null, year_level ?? null, id]
        );
        } else {
            await db.query(
                "INSERT INTO students (user_id, program, year_level) VALUES (?, ?, ?)",
                [id, program ?? null, year_level ?? null]
            );
        }
    } else if (role === "signatory") {
        const [existing]: any = await db.query(
            "SELECT signatory_id FROM signatories WHERE user_id = ?", [id]
        );
        if (existing.length > 0) {
            await db.query(
                "UPDATE signatories SET department=? WHERE user_id=?",
                [department ?? null, id]
            );
        } else {
            await db.query(
                "INSERT INTO signatories (user_id, department) VALUES (?, ?)",
                [id, department ?? null]
            );
        }
    } else if (role === "admin") {
        const [existing]: any = await db.query(
            "SELECT admin_id FROM administrators WHERE user_id = ?", [id]
        );
        if (existing.length === 0) {
            await db.query(
                "INSERT INTO administrators (user_id) VALUES (?)", [id]
            );
        }
    }

    return NextResponse.json({success: true, message: "User updated!"});
}

export async function DELETE(_: NextRequest, { params } : { params: Promise<{ id: string }> }) {

    const { id } = await params;
    let db = await createConnection();
    await db.query(
        "DELETE FROM users WHERE user_id=?", [parseInt(id)]
    );

    return NextResponse.json( {success: true, message: "User successfully deleted!"} );
}