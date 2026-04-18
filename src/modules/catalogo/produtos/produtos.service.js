'use strict';

const { v4: uuidv4 } = require('uuid');
const produtosRepository = require('./produtos.repository');
const categoriasRepository = require('../categorias/categorias.repository');
const { createError } = require('../../../utils/createError');

/**
 * Service de Produtos — regras de negócio isoladas do controller.
 */

async function listarProdutos({ categoriaId, ativo } = {}) {
  // Converte string "true"/"false" para boolean, se vier da query string
  const ativoFiltro =
    ativo === 'true' ? true : ativo === 'false' ? false : undefined;

  return produtosRepository.findAll({ categoriaId, ativo: ativoFiltro });
}

async function buscarProdutoPorId(id) {
  const produto = await produtosRepository.findById(id);
  if (!produto) throw createError('Produto não encontrado.', 404);
  return produto;
}

async function criarProduto({ nome, descricao, categoria_id }) {
  if (!nome || nome.trim() === '') {
    throw createError('O campo "nome" é obrigatório.');
  }
  if (!categoria_id) {
    throw createError('O campo "categoria_id" é obrigatório.');
  }

  const categoria = await categoriasRepository.findById(categoria_id);
  if (!categoria) throw createError('Categoria não encontrada.', 404);

  const existente = await produtosRepository.findByNomeAndCategoria(nome.trim(), categoria_id);
  if (existente) throw createError('Já existe um produto com este nome nessa categoria.');

  const id = uuidv4();
  return produtosRepository.create({ id, nome: nome.trim(), descricao, categoria_id });
}

async function ativarDesativarProduto(id, ativo) {
  await buscarProdutoPorId(id);
  return produtosRepository.setAtivo(id, ativo);
}

module.exports = { listarProdutos, buscarProdutoPorId, criarProduto, ativarDesativarProduto };
