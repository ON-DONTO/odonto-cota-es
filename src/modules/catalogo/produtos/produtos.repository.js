'use strict';

const { pool } = require('../../../config/database');

/**
 * Repository de Produtos — SQL puro com mysql2/promise.
 */

async function findAll({ categoriaId, ativo } = {}) {
  const condicoes = [];
  const params = [];

  if (categoriaId) {
    condicoes.push('p.categoria_id = ?');
    params.push(categoriaId);
  }
  if (ativo !== undefined) {
    condicoes.push('p.ativo = ?');
    params.push(ativo ? 1 : 0);
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

  const [rows] = await pool.execute(
    `SELECT p.id, p.nome, p.descricao, p.ativo,
            p.categoria_id, c.nome AS categoria_nome,
            a.id AS area_id, a.nome AS area_nome
     FROM produtos p
     INNER JOIN categorias c ON c.id = p.categoria_id
     INNER JOIN areas a ON a.id = c.area_id
     ${where}
     ORDER BY p.nome ASC`,
    params
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT p.id, p.nome, p.descricao, p.ativo,
            p.categoria_id, c.nome AS categoria_nome,
            a.id AS area_id, a.nome AS area_nome
     FROM produtos p
     INNER JOIN categorias c ON c.id = p.categoria_id
     INNER JOIN areas a ON a.id = c.area_id
     WHERE p.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findByNomeAndCategoria(nome, categoriaId) {
  const [rows] = await pool.execute(
    'SELECT id FROM produtos WHERE nome = ? AND categoria_id = ?',
    [nome, categoriaId]
  );
  return rows[0] || null;
}

async function create({ id, nome, descricao, categoria_id }) {
  await pool.execute(
    'INSERT INTO produtos (id, nome, descricao, categoria_id, ativo) VALUES (?, ?, ?, ?, 1)',
    [id, nome, descricao ?? null, categoria_id]
  );
  return findById(id);
}

async function setAtivo(id, ativo) {
  await pool.execute(
    'UPDATE produtos SET ativo = ? WHERE id = ?',
    [ativo ? 1 : 0, id]
  );
  return findById(id);
}

module.exports = { findAll, findById, findByNomeAndCategoria, create, setAtivo };
