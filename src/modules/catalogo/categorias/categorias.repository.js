'use strict';

const { pool } = require('../../../config/database');

/**
 * Repository de Categorias — SQL puro com mysql2/promise.
 */

async function findAll(areaId) {
  if (areaId) {
    const [rows] = await pool.execute(
      `SELECT c.id, c.nome, c.area_id, a.nome AS area_nome
       FROM categorias c
       INNER JOIN areas a ON a.id = c.area_id
       WHERE c.area_id = ?
       ORDER BY c.nome ASC`,
      [areaId]
    );
    return rows;
  }

  const [rows] = await pool.execute(
    `SELECT c.id, c.nome, c.area_id, a.nome AS area_nome
     FROM categorias c
     INNER JOIN areas a ON a.id = c.area_id
     ORDER BY a.nome ASC, c.nome ASC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT c.id, c.nome, c.area_id, a.nome AS area_nome
     FROM categorias c
     INNER JOIN areas a ON a.id = c.area_id
     WHERE c.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findByNomeAndArea(nome, areaId) {
  const [rows] = await pool.execute(
    'SELECT id FROM categorias WHERE nome = ? AND area_id = ?',
    [nome, areaId]
  );
  return rows[0] || null;
}

async function create({ id, nome, area_id }) {
  await pool.execute(
    'INSERT INTO categorias (id, nome, area_id) VALUES (?, ?, ?)',
    [id, nome, area_id]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute(
    'DELETE FROM categorias WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findByNomeAndArea, create, remove };
