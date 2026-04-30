import type { RowDataPacket } from "mysql2/promise";

type DbQueryable = {
  query: (sql: string, params?: unknown[]) => Promise<unknown>;
};

function isDuplicateColumnError(e: unknown): boolean {
  const err = e as { errno?: number; code?: string };
  return err.errno === 1060 || err.code === "ER_DUP_FIELDNAME";
}

async function migrateSignatoryAssignedProgramColumn(db: DbQueryable): Promise<void> {
  const [rows] = (await db.query(
    `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'signatories'
       AND COLUMN_NAME = 'assigned_program'`,
  )) as [RowDataPacket[], unknown];
  const count = Number((rows[0] as { c?: number } | undefined)?.c ?? 0);
  if (count > 0) return;
  try {
    await db.query(
      "ALTER TABLE signatories ADD COLUMN assigned_program VARCHAR(255) NULL DEFAULT NULL",
    );
  } catch (e) {
    if (isDuplicateColumnError(e)) return;
    throw e;
  }
}

let migrateOnce: Promise<void> | null = null;

/**
 * Ensures `signatories.assigned_program` exists.
 * Used to filter dean-type signatories by their assigned college program.
 * Runs once per process to avoid schema checks on every request.
 */
export function ensureSignatoryAssignedProgramColumn(db: DbQueryable): Promise<void> {
  if (!migrateOnce) {
    migrateOnce = migrateSignatoryAssignedProgramColumn(db).catch((e) => {
      migrateOnce = null;
      throw e;
    });
  }
  return migrateOnce;
}
