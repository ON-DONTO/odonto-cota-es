'use strict';

const { pool } = require('../../config/database');

async function findAll() {
  const [rows] = await pool.execute('SELECT id, nome, email, tipo, created_at FROM users ORDER BY created_at DESC');
  return rows;
}

async function remove(id) {
  await pool.execute('DELETE FROM users WHERE id = ?', [id]);
}

module.exports = {
  findAll,
  remove
};
