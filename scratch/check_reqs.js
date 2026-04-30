const mysql = require('mysql2/promise');
async function run() {
  const db = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'bcms' });
  try {
    const [rows] = await db.query("SELECT r.requirement_id, r.requirement_name, r.requirement_type, sg.department FROM requirements r JOIN signatories sg ON r.signatory_id = sg.signatory_id WHERE LOWER(sg.department) LIKE '%dean%' OR LOWER(sg.department) LIKE '%director%'");
    console.log(rows);
  } catch (e) {
    console.error('Query failed:', e);
  } finally {
    await db.end();
  }
}
run();
