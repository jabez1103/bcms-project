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

export async function createConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME,
    ssl: readSslConfig(),
    connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT_MS || 10000),
  });
}