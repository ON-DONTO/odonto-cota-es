'use strict';

const { v4: uuidv4 } = require('uuid');
const respostasRepository = require('./respostas.repository');

async function responder({ cotacao_id, fornecedor_id, observacoes, itens }) {
  const respostaId = uuidv4();
  
  // Calcular valor total baseado nos itens que o fornecedor TEM
  const valor_total = itens.reduce((acc, item) => {
    if (item.tem_produto) {
      return acc + (Number(item.preco_unitario) * (item.quantidade || 1));
    }
    return acc;
  }, 0);

  await respostasRepository.createResposta({
    id: respostaId,
    cotacao_id,
    fornecedor_id,
    valor_total,
    observacoes
  });

  const itensFormatados = itens.map(item => ({
    id: uuidv4(),
    resposta_id: respostaId,
    produto_id: item.produto_id,
    tem_produto: item.tem_produto,
    preco_unitario: item.preco_unitario,
    observacao_item: item.observacao_item
  }));

  await respostasRepository.addItensResposta(itensFormatados);

  return { id: respostaId, valor_total };
}

async function listByCotacao(cotacaoId) {
  const respostas = await respostasRepository.findByCotacaoId(cotacaoId);
  
  // Para cada resposta, buscar os itens detalhados
  const fullRespostas = await Promise.all(respostas.map(async (r) => {
    const itens = await respostasRepository.findItensByRespostaId(r.id);
    return { ...r, itens };
  }));

  return fullRespostas;
}

module.exports = {
  responder,
  listByCotacao
};
