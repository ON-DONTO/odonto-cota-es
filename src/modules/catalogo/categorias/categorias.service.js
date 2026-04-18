'use strict';

const { v4: uuidv4 } = require('uuid');
const categoriasRepository = require('./categorias.repository');
const areasRepository = require('../areas/areas.repository');
const { createError } = require('../../../utils/createError');

/**
 * Service de Categorias — regras de negócio isoladas do controller.
 */

async function listarCategorias(areaId) {
  if (areaId) {
    const area = await areasRepository.findById(areaId);
    if (!area) throw createError('Área não encontrada.', 404);
  }
  return categoriasRepository.findAll(areaId);
}

async function buscarCategoriaPorId(id) {
  const categoria = await categoriasRepository.findById(id);
  if (!categoria) throw createError('Categoria não encontrada.', 404);
  return categoria;
}

async function criarCategoria({ nome, area_id }) {
  if (!nome || nome.trim() === '') {
    throw createError('O campo "nome" é obrigatório.');
  }
  if (!area_id) {
    throw createError('O campo "area_id" é obrigatório.');
  }

  const area = await areasRepository.findById(area_id);
  if (!area) throw createError('Área não encontrada.', 404);
  if (!area.ativo) throw createError('A área informada está inativa.');

  const existente = await categoriasRepository.findByNomeAndArea(nome.trim(), area_id);
  if (existente) throw createError('Já existe uma categoria com este nome nessa área.');

  const id = uuidv4();
  return categoriasRepository.create({ id, nome: nome.trim(), area_id });
}

module.exports = { listarCategorias, buscarCategoriaPorId, criarCategoria };
