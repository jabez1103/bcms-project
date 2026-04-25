const fs = require("fs");
const mysql = require("mysql2/promise");

const env = fs.readFileSync(".env.local", "utf8").split("\n").reduce((acc, line) => {
  const [key, ...val] = line.split("=");
  if (key && val.length) acc[key.trim()] = val.join("=").trim().replace(/^"|"$/g, '');
  return acc;
}, {});

async function run() {
  try {
    const db = await mysql.createConnection({
      host: env.DB_HOST,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
    });
    console.log("Connected to DB.");

    const [rows] = await db.query("SHOW COLUMNS FROM users LIKE 'suffix'");
    if (rows.length === 0) {
      console.log("Adding suffix column to users table...");
      await db.query("ALTER TABLE users ADD COLUMN suffix VARCHAR(10) DEFAULT NULL;");
      console.log("Column added successfully.");
    } else {
      console.log("suffix column already exists.");
    }

    db.end();
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

run();
