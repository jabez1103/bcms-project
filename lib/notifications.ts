import { Connection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { sendPushToUsers } from "@/lib/pushNotifications";
import {
  appendNotificationReadParam,
  getNotificationBasePath,
} from "@/lib/notificationDeepLink";
import type { NotificationRole, NotificationType } from "@/lib/notificationTypes";
import { addSystemLogDb } from "@/lib/systemLogs";

export type { NotificationRole, NotificationType } from "@/lib/notificationTypes";

const PUSH_BODY_MAX = 360;
const DEFAULT_MAX_NOTIFICATIONS_PER_USER = 10;
const IN_MEMORY_MAX_NOTIFICATIONS_PER_USER = 10;

export type InMemoryNotification = {
  id: number;
  userId: number;
  role: NotificationRole;
  type: NotificationType | string;
  message: string;
  timestamp: string;
};

const memoryNotifications = new Map<number, InMemoryNotification[]>();
let memoryNotificationId = 1;

function getMaxNotificationsPerUser(): number {
  const fromEnv = Number(process.env.MAX_NOTIFICATIONS_PER_USER ?? "");
  if (Number.isFinite(fromEnv) && fromEnv > 0) return Math.floor(fromEnv);
  return DEFAULT_MAX_NOTIFICATIONS_PER_USER;
}

async function trimNotificationsForUser(db: Connection, userId: number): Promise<void> {
  const maxPerUser = getMaxNotificationsPerUser();
  await db.query(
    `DELETE FROM notifications
     WHERE user_id = ?
       AND notification_id NOT IN (
         SELECT notification_id
         FROM (
           SELECT notification_id
           FROM notifications
           WHERE user_id = ?
           ORDER BY created_at DESC, notification_id DESC
           LIMIT ?
         ) keep_rows
       )`,
    [userId, userId, maxPerUser],
  );
}

export type NotificationBulkOptions = {
  targetId?: number;
  /** Web Push title (device); defaults to `title`. */
  pushTitle?: string;
  /** Web Push body; keep short for mobile lock screens. Defaults to `message`. */
  pushBody?: string;
  /** Groups/replaces prior push with the same tag on the client. */
  pushTag?: string;
  /** Links this notification to a specific clearance period cycle. */
  clearancePeriodId?: number;
};

export type NotificationListItem = {
  id: number;
  type: string;
  title: string;
  message: string;
  targetId: number | null;
  isRead: boolean;
  timestamp: string;
};

interface CreateNotificationParams {
  db: Connection;
  userId: number;
  role: NotificationRole;
  type: NotificationType;
  title: string;
  message: string;
  targetId?: number; // requirement_id or submission_id for click-through navigation
  clearancePeriodId?: number; // links notification to a specific clearance cycle
}

export async function fetchLatestNotificationsForUser(
  db: Connection,
  userId: number,
  limit = getMaxNotificationsPerUser(),
  periodId?: number | null,
): Promise<NotificationListItem[]> {
  const maxPerUser = getMaxNotificationsPerUser();
  const capped = Math.max(1, Math.min(Math.floor(limit), maxPerUser));
  type NotificationRow = RowDataPacket & {
    id: number;
    type: string;
    title: string;
    message: string;
    targetId: number | null;
    isRead: 0 | 1;
    timestamp: string;
  };

  // If a periodId is provided, only return notifications for that cycle.
  // Notifications without a clearance_period_id (legacy) are excluded when filtering.
  const periodClause = periodId != null
    ? `AND clearance_period_id = ?`
    : ``;
  const params: (number | string)[] = periodId != null
    ? [userId, periodId, capped]
    : [userId, capped];

  const [rows] = await db.query<NotificationRow[]>(
    `SELECT
       notification_id  AS id,
       type,
       title,
       message,
       target_id        AS targetId,
       is_read          AS isRead,
       created_at       AS timestamp
     FROM notifications
     WHERE user_id = ?
     ${periodClause}
     ORDER BY created_at DESC, notification_id DESC
     LIMIT ?`,
    params,
  );

  return rows.map((r) => ({
    id: Number(r.id),
    type: String(r.type ?? ""),
    title: String(r.title ?? ""),
    message: String(r.message ?? ""),
    targetId: r.targetId == null ? null : Number(r.targetId),
    isRead: Boolean(r.isRead),
    timestamp: String(r.timestamp ?? ""),
  }));
}

/** In-memory fallback: add notification and keep newest N per user. */
export function addNotificationInMemory(input: {
  userId: number;
  role: NotificationRole;
  type: NotificationType | string;
  message: string;
}): number {
  const row: InMemoryNotification = {
    id: memoryNotificationId++,
    userId: Number(input.userId),
    role: input.role,
    type: String(input.type),
    message: String(input.message),
    timestamp: new Date().toISOString(),
  };
  const prev = memoryNotifications.get(row.userId) ?? [];
  const next = [row, ...prev];
  if (next.length > IN_MEMORY_MAX_NOTIFICATIONS_PER_USER) {
    next.length = IN_MEMORY_MAX_NOTIFICATIONS_PER_USER;
  }
  memoryNotifications.set(row.userId, next);
  return row.id;
}

/** In-memory fallback: fetch newest notifications for one user. */
export function fetchLatestNotificationsInMemory(
  userId: number,
  limit = IN_MEMORY_MAX_NOTIFICATIONS_PER_USER,
): Array<{ id: number; message: string; timestamp: string; type: string }> {
  const capped = Math.max(1, Math.min(Math.floor(limit), IN_MEMORY_MAX_NOTIFICATIONS_PER_USER));
  const rows = memoryNotifications.get(Number(userId)) ?? [];
  return rows.slice(0, capped).map((row) => ({
    id: row.id,
    message: row.message,
    timestamp: row.timestamp,
    type: row.type,
  }));
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
  clearancePeriodId,
}: CreateNotificationParams): Promise<void> {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO notifications (user_id, role, type, title, message, target_id, clearance_period_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, role, type, title, message, targetId ?? null, clearancePeriodId ?? null]
  );
  await trimNotificationsForUser(db, userId);

  const base = getNotificationBasePath(role, type, targetId);
  const pushUrl = appendNotificationReadParam(base, result.insertId);

  await sendPushToUsers(db, [userId], {
    title,
    body: message,
    url: pushUrl,
  });

  try {
    await addSystemLogDb(db, {
      type: "notification",
      message: `Notification sent to user ${userId}: ${title}`,
    });
  } catch {
    /* non-blocking log failure */
  }
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
  options?: NotificationBulkOptions
): Promise<void> {
  if (users.length === 0) return;

  const targetId = options?.targetId ?? null;
  const pushTitle = options?.pushTitle ?? title;
  const pushBody = (options?.pushBody ?? message).slice(0, PUSH_BODY_MAX);
  const clearancePeriodId = options?.clearancePeriodId ?? null;

  const values = users.map((u) => [u.userId, u.role, type, title, message, targetId, clearancePeriodId]);
  const [insertResult] = await db.query<ResultSetHeader>(
    `INSERT INTO notifications (user_id, role, type, title, message, target_id, clearance_period_id)
     VALUES ?`,
    [values]
  );
  const uniqueUserIds = [...new Set(users.map((u) => u.userId))];
  for (const userId of uniqueUserIds) {
    await trimNotificationsForUser(db, userId);
  }

  const firstId = insertResult.insertId;
  const chunkSize = 28;

  for (let i = 0; i < users.length; i += chunkSize) {
    const slice = users.slice(i, i + chunkSize);
    await Promise.all(
      slice.map((u, j) => {
        const idx = i + j;
        const notificationId = firstId + idx;
        const base = getNotificationBasePath(u.role, type, targetId ?? undefined);
        const pushUrl = appendNotificationReadParam(base, notificationId);
        return sendPushToUsers(db, [u.userId], {
          title: pushTitle,
          body: pushBody,
          url: pushUrl,
          tag: options?.pushTag,
        });
      })
    );
  }

  try {
    await addSystemLogDb(db, {
      type: "notification",
      message: `Bulk notification sent to ${users.length} users: ${title}`,
    });
  } catch {
    /* non-blocking log failure */
  }
}
