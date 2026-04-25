const fs = require('fs');
const mysql = require('mysql2/promise');

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
  const [rows] = await db.query('SELECT user_id, email, role FROM users LIMIT 3');
  console.log(JSON.stringify(rows, null, 2));
  db.end();
}

run();
