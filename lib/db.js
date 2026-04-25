import mysql from "mysql2/promise";

function readSslConfig() {
  const sslEnabled = String(process.env.DB_SSL ?? "").toLowerCase() === "true";
  if (!sslEnabled) return undefined;

  const caRaw = process.env.DB_SSL_CA || "";
  if (!caRaw) {
    // For providers with managed certificates (or local development)
    // allow SSL without explicit CA.
    return { rejectUnauthorized: false };
  }

  const trimmed = caRaw.trim();
  const parsedCa = trimmed.includes("BEGIN CERTIFICATE")
    ? trimmed
    : Buffer.from(trimmed, "base64").toString("utf8");

  return {
    ca: parsedCa,
    rejectUnauthorized: true,
  };
}

export const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: Number(process.env.MYSQLPORT),
  waitForConnections: true,
  connectionLimit: 10,
});

/**
 * Backward-compatible wrapper: returns a connection from the pool.
 * Existing consumers that call `const db = await createConnection()`
 * followed by `db.query(...)` and `db.end()` will continue to work.
 * Note: `connection.end()` releases the connection back to the pool
 * (equivalent to `connection.release()`).
 */
export async function createConnection() {
  return db.getConnection();
}
