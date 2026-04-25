import { verifySessionFromCookies } from "@/lib/requestSession";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, isTrustedMutationOrigin } from "@/lib/auth";
import { createConnection } from "@/lib/db";
import type { AuthTokenPayload } from "@/lib/auth";

type SubscriptionBody = {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

export async function POST(request: NextRequest) {
  if (!isTrustedMutationOrigin(request)) {
    return NextResponse.json(
      { success: false, message: "Untrusted request origin." },
      { status: 403 }
    );
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ success: false, message: "Not logged in." }, { status: 401 });

  const payload: AuthTokenPayload | null = await verifySessionFromCookies(request);
  if (!payload) return NextResponse.json({ success: false, message: "Invalid session." }, { status: 401 });

  const body = (await request.json()) as SubscriptionBody;
  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return NextResponse.json(
      { success: false, message: "Invalid subscription payload." },
      { status: 400 }
    );
  }

  const db = await createConnection();
  try {
    await db.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         user_id = VALUES(user_id),
         p256dh = VALUES(p256dh),
         auth = VALUES(auth)`,
      [payload.user_id, body.endpoint, body.keys.p256dh, body.keys.auth]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save push subscription.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  } finally {
    await db.end();
  }
}

export async function DELETE(request: NextRequest) {
  if (!isTrustedMutationOrigin(request)) {
    return NextResponse.json(
      { success: false, message: "Untrusted request origin." },
      { status: 403 }
    );
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ success: false, message: "Not logged in." }, { status: 401 });

  const payload: AuthTokenPayload | null = await verifySessionFromCookies(request);
  if (!payload) return NextResponse.json({ success: false, message: "Invalid session." }, { status: 401 });

  const body = (await request.json()) as SubscriptionBody;
  if (!body.endpoint) {
    return NextResponse.json({ success: false, message: "Endpoint is required." }, { status: 400 });
  }

  const db = await createConnection();
  try {
    await db.query(
      "DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?",
      [payload.user_id, body.endpoint]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove push subscription.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  } finally {
    await db.end();
  }
}
