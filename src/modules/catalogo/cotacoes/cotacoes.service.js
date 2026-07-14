'use strict';

const { v4: uuidv4 } = require('uuid');
const cotacoesRepository = require('./cotacoes.repository');

async function create({ dentista_id, observacoes, itens }) {
  const cotacaoId = uuidv4();
  
  await cotacoesRepository.createCotacao({
    id: cotacaoId,
    dentista_id,
    observacoes
  });

  const itensFormatados = itens.map(item => ({
    id: uuidv4(),
    cotacao_id: cotacaoId,
    produto_id: item.produto_id,
    quantidade: item.quantidade || 1
  }));

  await cotacoesRepository.addItens(itensFormatados);

  return { id: cotacaoId };
}

async function listAbertas() {
  return await cotacoesRepository.findAllAbertas();
}

async function getDetails(id) {
  const cotacao = await cotacoesRepository.findById(id);
  if (!cotacao) return null;

  const itens = await cotacoesRepository.findItensByCotacaoId(id);
  return { ...cotacao, itens };
}

async function listByDentista(dentistaId) {
  return await cotacoesRepository.findByDentistaId(dentistaId);
}

async function fechar(id) {
  const cotacao = await cotacoesRepository.findById(id);
  if (!cotacao) throw new Error('Cotação não encontrada.');
  if (cotacao.status === 'finalizada') throw new Error('Cotação já está finalizada.');
  const ok = await cotacoesRepository.fecharCotacao(id);
  if (!ok) throw new Error('Não foi possível fechar a cotação.');
  return { message: 'Cotação finalizada com sucesso.' };
}

module.exports = {
  create,
  listAbertas,
  getDetails,
  listByDentista,
  fechar
};
