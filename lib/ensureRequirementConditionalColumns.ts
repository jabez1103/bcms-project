import type { RowDataPacket } from "mysql2/promise";

type DbQueryable = {
  query: (sql: string, params?: unknown[]) => Promise<unknown>;
};

function isDuplicateColumnError(e: unknown): boolean {
  const err = e as { errno?: number; code?: string };
  return err.errno === 1060 || err.code === "ER_DUP_FIELDNAME";
}

async function ensureColumn(
  db: DbQueryable,
  column: string,
  definition: string
): Promise<void> {
  const [rows] = (await db.query(
    `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'requirements'
       AND COLUMN_NAME = ?`,
    [column]
  )) as [RowDataPacket[], unknown];
  const count = Number((rows[0] as { c?: number } | undefined)?.c ?? 0);
  if (count > 0) return;

  try {
    await db.query(`ALTER TABLE requirements ADD COLUMN ${column} ${definition}`);
  } catch (e) {
    if (isDuplicateColumnError(e)) return;
    throw e;
  }
}

async function migrateRequirementConditionalColumns(db: DbQueryable): Promise<void> {
  await ensureColumn(db, "conditional_signatory_ids", "TEXT NULL");
  await ensureColumn(db, "conditional_policy", "VARCHAR(32) NULL");
}

let migrateOnce: Promise<void> | null = null;

export function ensureRequirementConditionalColumns(db: DbQueryable): Promise<void> {
  if (!migrateOnce) {
    migrateOnce = migrateRequirementConditionalColumns(db).catch((e) => {
      migrateOnce = null;
      throw e;
    });
  }
  return migrateOnce;
}

