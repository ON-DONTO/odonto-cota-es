'use strict';

const { pool } = require('../../../config/database');

async function createResposta({ id, cotacao_id, fornecedor_id, valor_total, observacoes }) {
  await pool.execute(
    'INSERT INTO cotacao_respostas (id, cotacao_id, fornecedor_id, valor_total, observacoes, status) VALUES (?, ?, ?, ?, ?, "enviada")',
    [id, cotacao_id, fornecedor_id, valor_total, observacoes || null]
  );
}

async function addItensResposta(itens) {
  const query = 'INSERT INTO cotacao_resposta_itens (id, resposta_id, produto_id, tem_produto, preco_unitario, observacao_item) VALUES (?, ?, ?, ?, ?, ?)';
  for (const item of itens) {
    await pool.execute(query, [
      item.id, 
      item.resposta_id, 
      item.produto_id, 
      item.tem_produto ? 1 : 0, 
      item.preco_unitario || 0, 
      item.observacao_item || null
    ]);
  }
}

async function findByCotacaoId(cotacaoId) {
  const query = `
    SELECT r.*, u.nome as fornecedor_nome 
    FROM cotacao_respostas r
    JOIN users u ON r.fornecedor_id = u.id
    WHERE r.cotacao_id = ?
    ORDER BY r.valor_total ASC
  `;
  const [rows] = await pool.execute(query, [cotacaoId]);
  return rows;
}

async function findItensByRespostaId(respostaId) {
  const query = `
    SELECT ri.*, p.nome as produto_nome, p.marca as produto_marca
    FROM cotacao_resposta_itens ri
    JOIN produtos p ON ri.produto_id = p.id
    WHERE ri.resposta_id = ?
  `;
  const [rows] = await pool.execute(query, [respostaId]);
  return rows;
}

module.exports = {
  createResposta,
  addItensResposta,
  findByCotacaoId,
  findItensByRespostaId
};
