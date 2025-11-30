/*
  Applies the updated GetStudentSessions procedure using the pool config.
  Sends raw SQL with multipleStatements enabled.
*/
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const sqlPath = path.resolve(__dirname, 'update-procedure-GetStudentSessions.sql');
  const raw = fs.readFileSync(sqlPath, 'utf8');

  // Strip DELIMITER lines and normalize the procedure body
  const cleaned = raw
    .replace(/\r/g, '')
    .split('\n')
    .filter(line => !/^\s*DELIMITER/i.test(line))
    .join('\n')
    .replace(/END\s*\/\/\s*$/m, 'END')
    .trim();

  // Create a one-off connection with multipleStatements enabled
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 26601,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    await conn.query(cleaned);
    console.log('✓ Successfully updated GetStudentSessions procedure');
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('✗ Failed applying procedure:', err.sqlMessage || err.message);
    await conn.end();
    process.exit(1);
  }
})();
