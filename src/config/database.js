'use strict';

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '-03:00',
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Conexão com o banco de dados estabelecida.');
    conn.release();
  } catch (err) {
    console.error('❌ Erro ao conectar com o banco de dados:', err.message);
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
