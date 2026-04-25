import type { Connection, RowDataPacket } from "mysql2/promise";
import webpush from "web-push";

type PushPayload = {
  title: string;
  body: string;
  url?: string;
  /** Same tag replaces an earlier notification on the device (e.g. updated clearance window). */
  tag?: string;
};

type PushSubscriptionRow = RowDataPacket & {
  subscription_id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
};

function getVapidConfig() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@bisu.edu.ph";

  if (!publicKey || !privateKey) {
    return null;
  }

  return { publicKey, privateKey, subject };
}

function configureWebPush() {
  const vapid = getVapidConfig();
  if (!vapid) return null;

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);
  return vapid;
}

export function getPublicVapidKey() {
  return process.env.VAPID_PUBLIC_KEY || null;
}

export async function sendPushToUsers(
  db: Connection,
  userIds: number[],
  payload: PushPayload
) {
  const vapid = configureWebPush();
  if (!vapid || userIds.length === 0) return;

  const placeholders = userIds.map(() => "?").join(",");
  const [rows] = await db.query<PushSubscriptionRow[]>(
    `SELECT subscription_id, endpoint, p256dh, auth
     FROM push_subscriptions
     WHERE user_id IN (${placeholders})`,
    userIds
  );

  if (rows.length === 0) return;

  const serializedPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/",
    ...(payload.tag ? { tag: payload.tag } : {}),
  });

  for (const row of rows) {
    try {
      await webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: {
            p256dh: row.p256dh,
            auth: row.auth,
          },
        },
        serializedPayload,
        {
          // Retain undelivered pushes while devices are offline (max supported by many gateways).
          TTL: 60 * 60 * 24 * 28,
        }
      );
    } catch (error) {
      const statusCode =
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        typeof (error as { statusCode?: number }).statusCode === "number"
          ? (error as { statusCode: number }).statusCode
          : null;

      // Auto-clean invalid/expired subscriptions.
      if (statusCode === 404 || statusCode === 410) {
        await db.query("DELETE FROM push_subscriptions WHERE subscription_id = ?", [
          row.subscription_id,
        ]);
      }
    }
  }
}
