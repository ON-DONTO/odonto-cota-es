'use strict';

const { pool } = require('../../../config/database');

/**
 * Repository de Áreas — SQL puro com mysql2/promise.
 */

async function findAll() {
  const [rows] = await pool.execute(
    'SELECT id, nome, descricao, ativo FROM areas ORDER BY nome ASC'
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, nome, descricao, ativo FROM areas WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function findByNome(nome) {
  const [rows] = await pool.execute(
    'SELECT id FROM areas WHERE nome = ?',
    [nome]
  );
  return rows[0] || null;
}

async function create({ id, nome, descricao }) {
  await pool.execute(
    'INSERT INTO areas (id, nome, descricao, ativo) VALUES (?, ?, ?, 1)',
    [id, nome, descricao ?? null]
  );
  return findById(id);
}

async function update(id, { nome, descricao }) {
  await pool.execute(
    'UPDATE areas SET nome = ?, descricao = ? WHERE id = ?',
    [nome, descricao ?? null, id]
  );
  return findById(id);
}

async function setAtivo(id, ativo) {
  await pool.execute(
    'UPDATE areas SET ativo = ? WHERE id = ?',
    [ativo ? 1 : 0, id]
  );
  return findById(id);
}

module.exports = { findAll, findById, findByNome, create, update, setAtivo };
