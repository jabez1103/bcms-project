import mysql from "mysql2/promise";

async function main() {
  const required = ["DB_HOST", "DB_USER", "DB_NAME"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
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
