import { NextResponse } from "next/server";
import { getPublicVapidKey } from "@/lib/pushNotifications";

export async function GET() {
  const publicKey = getPublicVapidKey();

  if (!publicKey) {
    return NextResponse.json(
      { success: false, message: "Push notifications are not configured." },
      { status: 503 }
    );
  }

  return NextResponse.json({ success: true, publicKey });
}
