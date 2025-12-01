// database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 26601,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  dateStrings: true
});

// Set timezone to EST for all connections
pool.on('connection', (connection) => {
  connection.query("SET time_zone='-05:00'");
});

// Test the connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Successfully connected to Aiven MySQL database');
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ Error connecting to MySQL database:', error.message);
    return false;
  }
};

module.exports = { pool, testConnection };
