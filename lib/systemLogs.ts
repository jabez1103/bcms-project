import type { Connection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export type SystemLogType = "info" | "warning" | "error" | "auth" | "notification";

export type SystemLogRow = {
  id: number;
  type: SystemLogType | string;
  message: string;
  timestamp: string;
};

const DEFAULT_MAX_SYSTEM_LOGS = 100;
const IN_MEMORY_LOG_CAP = 300;

const memoryLogs: SystemLogRow[] = [];
let memoryLogId = 1;

function getMaxLogsLimit(): number {
  const fromEnv = Number(process.env.SYSTEM_LOG_MAX ?? "");
  if (Number.isFinite(fromEnv) && fromEnv > 0) return Math.floor(fromEnv);
  return DEFAULT_MAX_SYSTEM_LOGS;
}

async function trimSystemLogsDb(db: Connection, maxLogs = getMaxLogsLimit()): Promise<void> {
  await db.query(
    `DELETE FROM system_logs
     WHERE log_id NOT IN (
       SELECT log_id
       FROM (
         SELECT log_id
         FROM system_logs
         ORDER BY created_at DESC, log_id DESC
         LIMIT ?
       ) keep_rows
     )`,
    [maxLogs],
  );
}

export async function addSystemLogDb(
  db: Connection,
  input: { type: SystemLogType | string; message: string; maxLogs?: number },
): Promise<number> {
  const [result] = await db.query<ResultSetHeader>(
    "INSERT INTO system_logs (type, message) VALUES (?, ?)",
    [String(input.type), String(input.message)],
  );
  await trimSystemLogsDb(db, input.maxLogs ?? getMaxLogsLimit());
  return result.insertId;
}

export async function cleanupSystemLogsOlderThanDaysDb(
  db: Connection,
  olderThanDays: number,
): Promise<number> {
  if (!Number.isFinite(olderThanDays) || olderThanDays <= 0) return 0;
  const [result] = await db.query<ResultSetHeader>(
    `DELETE FROM system_logs
     WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [Math.floor(olderThanDays)],
  );
  return result.affectedRows ?? 0;
}

export async function fetchSystemLogsDb(
  db: Connection,
  limit = getMaxLogsLimit(),
): Promise<SystemLogRow[]> {
  const cappedLimit = Math.max(1, Math.min(Math.floor(limit), 500));
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT
       log_id AS id,
       type,
       message,
       created_at AS timestamp
     FROM system_logs
     ORDER BY created_at DESC, log_id DESC
     LIMIT ?`,
    [cappedLimit],
  );

  return rows.map((r) => ({
    id: Number(r.id),
    type: String(r.type ?? "info"),
    message: String(r.message ?? ""),
    timestamp: String(r.timestamp ?? ""),
  }));
}

/** In-memory fallback (useful for local/dev or non-DB mode). */
export function addSystemLogInMemory(input: {
  type: SystemLogType | string;
  message: string;
}): number {
  const row: SystemLogRow = {
    id: memoryLogId++,
    type: String(input.type),
    message: String(input.message),
    timestamp: new Date().toISOString(),
  };
  memoryLogs.unshift(row);
  if (memoryLogs.length > IN_MEMORY_LOG_CAP) {
    memoryLogs.length = IN_MEMORY_LOG_CAP;
  }
  return row.id;
}

/** In-memory fetch (newest first). */
export function fetchSystemLogsInMemory(limit = getMaxLogsLimit()): SystemLogRow[] {
  const capped = Math.max(1, Math.min(Math.floor(limit), IN_MEMORY_LOG_CAP));
  return memoryLogs.slice(0, capped);
}
