import mysql from "mysql2/promise";

async function main() {
  const host = process.env.DB_HOST || process.env.MYSQLHOST;
  const user = process.env.DB_USER || process.env.MYSQLUSER;
  const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD;
  const database = process.env.DB_NAME || process.env.MYSQLDATABASE;
  const portRaw = process.env.DB_PORT || process.env.MYSQLPORT;
  const port = portRaw ? Number(portRaw) : undefined;

  const missing = [
    !host ? "DB_HOST or MYSQLHOST" : null,
    !user ? "DB_USER or MYSQLUSER" : null,
    !database ? "DB_NAME or MYSQLDATABASE" : null,
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

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
         AND TABLE_NAME = 'users'
         AND COLUMN_NAME = 'session_token'`
    );
    const count = Number(rows?.[0]?.c ?? 0);

    if (count > 0) {
      console.log("users.session_token already exists.");
      return;
    }

    await db.query(
      "ALTER TABLE users ADD COLUMN session_token VARCHAR(64) NULL DEFAULT NULL"
    );
    console.log("Added users.session_token column.");
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
