'use strict';

const areasService = require('./areas.service');

/**
 * Controller de Áreas — apenas req/res, sem lógica de negócio.
 */

async function listar(req, res, next) {
  try {
    const areas = await areasService.listarAreas();
    return res.status(200).json(areas);
  } catch (err) {
    next(err);
  }
}

async function buscarPorId(req, res, next) {
  try {
    const area = await areasService.buscarAreaPorId(req.params.id);
    return res.status(200).json(area);
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const area = await areasService.criarArea(req.body);
    return res.status(201).json(area);
  } catch (err) {
    next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const area = await areasService.atualizarArea(req.params.id, req.body);
    return res.status(200).json(area);
  } catch (err) {
    next(err);
  }
}

async function ativar(req, res, next) {
  try {
    const area = await areasService.ativarDesativarArea(req.params.id, true);
    return res.status(200).json(area);
  } catch (err) {
    next(err);
  }
}

async function desativar(req, res, next) {
  try {
    const area = await areasService.ativarDesativarArea(req.params.id, false);
    return res.status(200).json(area);
  } catch (err) {
    next(err);
  }
}

async function deletar(req, res, next) {
  try {
    await areasService.deletarArea(req.params.id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, ativar, desativar, deletar };
