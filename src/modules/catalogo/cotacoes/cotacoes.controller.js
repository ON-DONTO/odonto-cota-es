'use strict';

const cotacoesService = require('./cotacoes.service');

async function create(req, res, next) {
  try {
    const { id: dentista_id } = req.user;
    const { observacoes, itens } = req.body;

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ message: 'A cotação deve ter pelo menos um item.' });
    }

    const result = await cotacoesService.create({ dentista_id, observacoes, itens });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function listAbertas(req, res, next) {
  try {
    const cotacoes = await cotacoesService.listAbertas();
    res.json(cotacoes);
  } catch (error) {
    next(error);
  }
}

async function getDetails(req, res, next) {
  try {
    const { id } = req.params;
    const details = await cotacoesService.getDetails(id);
    
    if (!details) {
      return res.status(404).json({ message: 'Cotação não encontrada.' });
    }

    res.json(details);
  } catch (error) {
    next(error);
  }
}

async function listMinhas(req, res, next) {
  try {
    const { id: dentista_id } = req.user;
    const cotacoes = await cotacoesService.listByDentista(dentista_id);
    res.json(cotacoes);
  } catch (error) {
    next(error);
  }
}

async function fechar(req, res, next) {
  try {
    const { id } = req.params;
    const result = await cotacoesService.fechar(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  listAbertas,
  getDetails,
  listMinhas,
  fechar
};
