const fs = require('fs');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length) acc[key.trim()] = val.join('=').trim().replace(/^"|"$/g, '');
  return acc;
}, {});

async function run() {
  const db = await mysql.createConnection({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
  });
  const hash = await bcrypt.hash('password123', 10);
  await db.query('UPDATE users SET password = ? WHERE user_id = 100', [hash]);
  await db.query('UPDATE users SET password = ? WHERE user_id = 200', [hash]);
  console.log('Passwords updated to password123 for users 100 and 200');
  db.end();
}

run();
