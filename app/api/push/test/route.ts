import { verifySessionFromCookies } from "@/lib/requestSession";
import { NextRequest, NextResponse } from "next/server";
import { isTrustedMutationOrigin, type AuthTokenPayload } from "@/lib/auth";
import { createConnection } from "@/lib/db";
import { sendPushToUsers } from "@/lib/pushNotifications";

export async function POST(request: NextRequest) {
  if (!isTrustedMutationOrigin(request)) {
    return NextResponse.json(
      { success: false, message: "Untrusted request origin." },
      { status: 403 }
    );
  }

  const payload: AuthTokenPayload | null = await verifySessionFromCookies(request);
  if (!payload || String(payload.role).toLowerCase() !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const db = await createConnection();
  try {
    await sendPushToUsers(db, [Number(payload.user_id)], {
      title: "BCMS Push Test",
      body: "Push notifications are active on this device.",
      url: "/admin/home",
    });

    return NextResponse.json({ success: true, message: "Test push sent." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send test push.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  } finally {
    await db.end();
  }
}
