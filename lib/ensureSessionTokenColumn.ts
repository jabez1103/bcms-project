import type { RowDataPacket } from "mysql2/promise";

type DbQueryable = {
  query: (sql: string, params?: unknown[]) => Promise<unknown>;
};

function isDuplicateColumnError(e: unknown): boolean {
  const err = e as { errno?: number; code?: string };
  return err.errno === 1060 || err.code === "ER_DUP_FIELDNAME";
}

async function migrateSessionTokenColumn(db: DbQueryable): Promise<void> {
  const [rows] = (await db.query(
    `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'users'
       AND COLUMN_NAME = 'session_token'`,
  )) as [RowDataPacket[], unknown];
  const count = Number((rows[0] as { c?: number } | undefined)?.c ?? 0);
  if (count > 0) return;
  try {
    await db.query(
      "ALTER TABLE users ADD COLUMN session_token VARCHAR(64) NULL DEFAULT NULL",
    );
  } catch (e) {
    if (isDuplicateColumnError(e)) return;
    throw e;
  }
}

let migrateOnce: Promise<void> | null = null;

/**
 * Ensures `users.session_token` exists (single-session feature).
 * Safe to call from any route; runs at most one successful migration per process.
 */
export function ensureUsersSessionTokenColumn(db: DbQueryable): Promise<void> {
  if (!migrateOnce) {
    migrateOnce = migrateSessionTokenColumn(db).catch((e) => {
      migrateOnce = null;
      throw e;
    });
  }
  return migrateOnce;
}
