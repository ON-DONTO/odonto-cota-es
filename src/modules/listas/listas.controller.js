'use strict';

const listasService = require('./listas.service');

async function vincular(req, res, next) {
  try {
    const { codigo } = req.body;
    const result = await listasService.vincularProfessor(req.user.id, codigo);
    res.json({
      message: 'Professor vinculado com sucesso!',
      ...result
    });
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const result = await listasService.criarLista(req.user.id, req.body);
    res.status(201).json({
      message: 'Lista acadêmica criada com sucesso!',
      ...result
    });
  } catch (err) {
    next(err);
  }
}

async function listar(req, res, next) {
  try {
    const result = await listasService.listarPorUsuario(req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function visualizar(req, res, next) {
  try {
    const result = await listasService.obterDetalhes(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function excluir(req, res, next) {
  try {
    const result = await listasService.removerLista(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  vincular,
  criar,
  listar,
  visualizar,
  excluir
};
