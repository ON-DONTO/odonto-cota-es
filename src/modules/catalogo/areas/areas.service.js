'use strict';

const { v4: uuidv4 } = require('uuid');
const areasRepository = require('./areas.repository');
const { createError } = require('../../../utils/createError');

/**
 * Service de Áreas — regras de negócio isoladas do controller.
 */

async function listarAreas() {
  return areasRepository.findAll();
}

async function buscarAreaPorId(id) {
  const area = await areasRepository.findById(id);
  if (!area) throw createError('Área não encontrada.', 404);
  return area;
}

async function criarArea({ nome, descricao }) {
  if (!nome || nome.trim() === '') {
    throw createError('O campo "nome" é obrigatório.');
  }

  const existente = await areasRepository.findByNome(nome.trim());
  if (existente) throw createError('Já existe uma área com este nome.');

  const id = uuidv4();
  return areasRepository.create({ id, nome: nome.trim(), descricao });
}

async function atualizarArea(id, { nome, descricao }) {
  await buscarAreaPorId(id);

  if (!nome || nome.trim() === '') {
    throw createError('O campo "nome" é obrigatório.');
  }

  const existente = await areasRepository.findByNome(nome.trim());
  if (existente && existente.id !== id) {
    throw createError('Já existe outra área com este nome.');
  }

  return areasRepository.update(id, { nome: nome.trim(), descricao });
}

async function ativarDesativarArea(id, ativo) {
  await buscarAreaPorId(id);
  return areasRepository.setAtivo(id, ativo);
}

async function deletarArea(id) {
  await buscarAreaPorId(id);
  // Nota: Poderia haver uma verificação aqui para impedir a exclusão se houver categorias vinculadas
  return areasRepository.remove(id);
}

module.exports = { 
  listarAreas, 
  buscarAreaPorId, 
  criarArea, 
  atualizarArea, 
  ativarDesativarArea,
  deletarArea
};
