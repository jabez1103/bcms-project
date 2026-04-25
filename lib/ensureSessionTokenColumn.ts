import type { RowDataPacket } from "mysql2/promise";

type DbQueryable = {
  query: (sql: string, params?: unknown[]) => Promise<unknown>;
};

async function assertSessionTokenColumnExists(db: DbQueryable): Promise<void> {
  const [rows] = (await db.query(
    `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'users'
       AND COLUMN_NAME = 'session_token'`,
  )) as [RowDataPacket[], unknown];
  const count = Number((rows[0] as { c?: number } | undefined)?.c ?? 0);
  if (count <= 0) {
    throw new Error(
      "Missing required database column users.session_token. Run the session auth migration before starting production.",
    );
  }
}

let migrateOnce: Promise<void> | null = null;

/**
 * Verifies `users.session_token` exists (single-session feature).
 * Runs once per process to avoid schema checks on every request.
 */
export function ensureUsersSessionTokenColumn(db: DbQueryable): Promise<void> {
  if (!migrateOnce) {
    migrateOnce = assertSessionTokenColumnExists(db).catch((e) => {
      migrateOnce = null;
      throw e;
    });
  }
  return migrateOnce;
}
