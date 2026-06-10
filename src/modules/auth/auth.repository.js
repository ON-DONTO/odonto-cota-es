'use strict';

const { pool } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Busca um usuário pelo email
 */
async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

/**
 * Busca um usuário pelo ID
 */
async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
}

/**
 * Cria um novo usuário
 */
async function create(userData) {
  const { nome, email, senha, tipo = 'cliente', codigo_acesso = null } = userData;
  const id = uuidv4();

  const query = `
    INSERT INTO users (id, nome, email, senha, tipo, codigo_acesso)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  await pool.query(query, [id, nome, email, senha, tipo, codigo_acesso]);

  return { id, nome, email, tipo, codigo_acesso };
}

module.exports = {
  findByEmail,
  findById,
  create
};
