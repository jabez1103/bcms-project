import { NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const { user_id, first_name, middle_name, last_name, email, password, role, account_status} = await request.json();

    let db = await createConnection();
    await db.query(
        "UPDATE users SET user_id=?, first_name=?, middle_name=?, last_name=?, email=?, password=?, role=?, account_status WHERE user_id=?",
        [user_id, first_name, middle_name ?? null, last_name, email, password, role, account_status, params.id]
    );

    return NextResponse.json({success: true, message: "User updated!"});
}

export async function DELETE(_: NextRequest, { params } : { params: { id: string } }) {

    let db = await createConnection();
    await db.query(
        "DELETE FROM users WHERE user_id=?", [params.id]
    );

    return NextResponse.json( {success: true, message: "User successfully deleted!"} );
}