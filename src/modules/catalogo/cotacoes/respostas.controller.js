'use strict';

const respostasService = require('./respostas.service');

async function responder(req, res, next) {
  try {
    const { id: fornecedor_id } = req.user;
    const { cotacao_id, observacoes, itens } = req.body;

    if (!cotacao_id || !itens || !Array.isArray(itens)) {
      return res.status(400).json({ message: 'Dados da resposta inválidos.' });
    }

    const result = await respostasService.responder({
      cotacao_id,
      fornecedor_id,
      observacoes,
      itens
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function listByCotacao(req, res, next) {
  try {
    const { cotacaoId } = req.params;
    const respostas = await respostasService.listByCotacao(cotacaoId);
    res.json(respostas);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  responder,
  listByCotacao
};
