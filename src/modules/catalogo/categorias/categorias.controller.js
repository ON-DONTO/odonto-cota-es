'use strict';

const categoriasService = require('./categorias.service');

/**
 * Controller de Categorias — apenas req/res, sem lógica de negócio.
 */

async function listar(req, res, next) {
  try {
    const { area_id } = req.query;
    const categorias = await categoriasService.listarCategorias(area_id);
    return res.status(200).json(categorias);
  } catch (err) {
    next(err);
  }
}

async function buscarPorId(req, res, next) {
  try {
    const categoria = await categoriasService.buscarCategoriaPorId(req.params.id);
    return res.status(200).json(categoria);
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const categoria = await categoriasService.criarCategoria(req.body);
    return res.status(201).json(categoria);
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, buscarPorId, criar };
