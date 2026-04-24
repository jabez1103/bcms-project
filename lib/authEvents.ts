import { Connection } from "mysql2/promise";

export type AuthEventType = "login" | "logout" | "password_changed";

/**
 * Inserts a single row into auth_events.
 * Call after successful login, logout, or password change.
 */
export async function logAuthEvent(
  db: Connection,
  userId: number,
  eventType: AuthEventType,
  ipAddress?: string | null,
  userAgent?: string | null
): Promise<void> {
  await db.query(
    `INSERT INTO auth_events (user_id, event_type, ip_address, user_agent)
     VALUES (?, ?, ?, ?)`,
    [userId, eventType, ipAddress ?? null, userAgent ?? null]
  );
}
