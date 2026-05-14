'use strict';

const { pool } = require('../../../config/database');

async function createCotacao({ id, dentista_id, observacoes }) {
  await pool.execute(
    'INSERT INTO cotacoes (id, dentista_id, observacoes, status) VALUES (?, ?, ?, "aberta")',
    [id, dentista_id, observacoes || null]
  );
}

async function addItens(itens) {
  const query = 'INSERT INTO cotacao_itens (id, cotacao_id, produto_id, quantidade) VALUES (?, ?, ?, ?)';
  for (const item of itens) {
    await pool.execute(query, [item.id, item.cotacao_id, item.produto_id, item.quantidade]);
  }
}

async function findAllAbertas() {
  const query = `
    SELECT c.*, u.nome as dentista_nome 
    FROM cotacoes c
    JOIN users u ON c.dentista_id = u.id
    WHERE c.status = 'aberta'
    ORDER BY c.created_at DESC
  `;
  const [rows] = await pool.execute(query);
  return rows;
}

async function findById(id) {
  const query = `
    SELECT c.*, u.nome as dentista_nome 
    FROM cotacoes c
    JOIN users u ON c.dentista_id = u.id
    WHERE c.id = ?
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0];
}

async function findItensByCotacaoId(cotacaoId) {
  const query = `
    SELECT ci.*, p.nome as produto_nome, p.marca as produto_marca, p.imagem_url
    FROM cotacao_itens ci
    JOIN produtos p ON ci.produto_id = p.id
    WHERE ci.cotacao_id = ?
  `;
  const [rows] = await pool.execute(query, [cotacaoId]);
  return rows;
}

async function findByDentistaId(dentistaId) {
  const query = `
    SELECT * FROM cotacoes WHERE dentista_id = ? ORDER BY created_at DESC
  `;
  const [rows] = await pool.execute(query, [dentistaId]);
  return rows;
}

module.exports = {
  createCotacao,
  addItens,
  findAllAbertas,
  findById,
  findItensByCotacaoId,
  findByDentistaId
};
