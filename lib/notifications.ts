import { Connection } from "mysql2/promise";

export type NotificationRole = "student" | "admin" | "signatory";

export type NotificationType =
  | "submission_received"
  | "submission_approved"
  | "submission_rejected"
  | "period_opened"
  | "period_closed";

interface CreateNotificationParams {
  db: Connection;
  userId: number;
  role: NotificationRole;
  type: NotificationType;
  title: string;
  message: string;
  targetId?: number; // requirement_id or submission_id for click-through navigation
}

/**
 * Insert a single notification for one user.
 */
export async function createNotification({
  db,
  userId,
  role,
  type,
  title,
  message,
  targetId,
}: CreateNotificationParams): Promise<void> {
  await db.query(
    `INSERT INTO notifications (user_id, role, type, title, message, target_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, role, type, title, message, targetId ?? null]
  );
}

/**
 * Bulk-insert the same notification for many users at once.
 * users = [{ userId, role }]
 */
export async function createNotificationBulk(
  db: Connection,
  users: { userId: number; role: NotificationRole }[],
  type: NotificationType,
  title: string,
  message: string,
  targetId?: number
): Promise<void> {
  if (users.length === 0) return;

  const values = users.map((u) => [u.userId, u.role, type, title, message, targetId ?? null]);
  await db.query(
    `INSERT INTO notifications (user_id, role, type, title, message, target_id)
     VALUES ?`,
    [values]
  );
}
