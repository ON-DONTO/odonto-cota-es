'use strict';

const produtosService = require('./produtos.service');

/**
 * Controller de Produtos — apenas req/res, sem lógica de negócio.
 */

async function listar(req, res, next) {
  try {
    const { categoria_id, ativo } = req.query;
    const produtos = await produtosService.listarProdutos({ categoriaId: categoria_id, ativo });
    return res.status(200).json(produtos);
  } catch (err) {
    next(err);
  }
}

async function buscarPorId(req, res, next) {
  try {
    const produto = await produtosService.buscarProdutoPorId(req.params.id);
    return res.status(200).json(produto);
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const produto = await produtosService.criarProduto(req.body);
    return res.status(201).json(produto);
  } catch (err) {
    next(err);
  }
}

async function ativar(req, res, next) {
  try {
    const produto = await produtosService.ativarDesativarProduto(req.params.id, true);
    return res.status(200).json(produto);
  } catch (err) {
    next(err);
  }
}

async function desativar(req, res, next) {
  try {
    const produto = await produtosService.ativarDesativarProduto(req.params.id, false);
    return res.status(200).json(produto);
  } catch (err) {
    next(err);
  }
}

async function deletar(req, res, next) {
  try {
    await produtosService.deletarProduto(req.params.id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, buscarPorId, criar, ativar, desativar, deletar };
