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
  const [typeRows] = (await db.query(
    `SELECT DATA_TYPE AS dataType,
            COLUMN_TYPE AS columnType,
            CHARACTER_MAXIMUM_LENGTH AS maxLen
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'requirements'
        AND COLUMN_NAME = 'requirement_type'
      LIMIT 1`
  )) as [RowDataPacket[], unknown];

  const typeRow = typeRows[0] as
    | { dataType?: string; columnType?: string; maxLen?: number | null }
    | undefined;
  const dataType = String(typeRow?.dataType ?? "").toLowerCase();
  const columnType = String(typeRow?.columnType ?? "").toLowerCase();
  const maxLen = Number(typeRow?.maxLen ?? 0);

  // Older schemas often have enum('digital','physical') or a short VARCHAR.
  // Ensure "conditional" can be stored to avoid truncation errors.
  if (dataType === "enum") {
    const rawValues = columnType.match(/'([^']*)'/g) ?? [];
    const values = rawValues.map((v) => v.slice(1, -1));
    if (!values.some((v) => v.toLowerCase() === "conditional")) {
      const nextValues = [...values, "conditional"];
      const enumSql = nextValues
        .map((v) => `'${v.replace(/'/g, "''")}'`)
        .join(", ");
      await db.query(
        `ALTER TABLE requirements MODIFY COLUMN requirement_type ENUM(${enumSql}) NOT NULL`
      );
    }
  } else if ((dataType === "varchar" || dataType === "char") && maxLen > 0 && maxLen < 11) {
    await db.query(
      "ALTER TABLE requirements MODIFY COLUMN requirement_type VARCHAR(32) NOT NULL"
    );
  }

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

