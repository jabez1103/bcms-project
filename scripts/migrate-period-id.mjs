import mysql from "mysql2/promise";
import fs from "fs";

async function main() {
  const host = process.env.DB_HOST || process.env.MYSQLHOST || 'localhost';
  const user = process.env.DB_USER || process.env.MYSQLUSER || 'root';
  const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '';
  const database = process.env.DB_NAME || process.env.MYSQLDATABASE || 'bcms';
  const portRaw = process.env.DB_PORT || process.env.MYSQLPORT;
  const port = portRaw ? Number(portRaw) : undefined;

  const db = await mysql.createConnection({
    host,
    user,
    password,
    database,
    ...(Number.isFinite(port) ? { port } : {}),
  });

  try {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'notifications'
         AND COLUMN_NAME = 'clearance_period_id'`
    );
    const count = Number(rows?.[0]?.c ?? 0);

    if (count > 0) {
      console.log("notifications.clearance_period_id already exists.");
      return;
    }

    await db.query(
      "ALTER TABLE notifications ADD COLUMN clearance_period_id INT DEFAULT NULL AFTER target_id"
    );
    await db.query(
      "ALTER TABLE notifications ADD INDEX idx_notifications_period (clearance_period_id)"
    );
    console.log("Added notifications.clearance_period_id column and index.");
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
