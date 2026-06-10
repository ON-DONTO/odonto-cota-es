'use strict';

const listasRepository = require('./listas.repository');
const { createError } = require('../../utils/createError');

/**
 * Vincula um aluno a um professor usando o código do professor
 */
async function vincularProfessor(studentId, code) {
  if (!code) {
    throw createError('Código de acesso é obrigatório', 400);
  }

  const teacher = await listasRepository.findTeacherByCode(code.trim().toUpperCase());
  if (!teacher) {
    throw createError('Código inválido ou professor não encontrado', 404);
  }

  await listasRepository.linkStudentToTeacher(studentId, teacher.id);
  
  return {
    professor_id: teacher.id,
    professor_nome: teacher.nome
  };
}

/**
 * Cria uma nova lista acadêmica com seus respectivos itens
 */
async function criarLista(professorId, { nome, descricao, semestre, itens }) {
  if (!nome || nome.trim() === '') {
    throw createError('Nome da lista é obrigatório', 400);
  }

  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    throw createError('A lista precisa conter pelo menos um item', 400);
  }

  const listId = await listasRepository.createList({
    professorId,
    nome: nome.trim(),
    descricao: descricao ? descricao.trim() : null,
    semestre: semestre ? semestre.trim() : null
  });

  await listasRepository.addListItems(listId, itens);

  return { id: listId };
}

/**
 * Retorna as listas de acordo com o papel do usuário (professor ou aluno)
 */
async function listarPorUsuario(user) {
  if (user.tipo === 'professor') {
    return await listasRepository.findByProfessorId(user.id);
  } else if (user.tipo === 'aluno') {
    return await listasRepository.findByStudentId(user.id);
  } else {
    throw createError('Tipo de usuário não autorizado para esta consulta', 403);
  }
}

/**
 * Retorna os detalhes de uma lista e seus itens
 */
async function obterDetalhes(id) {
  const lista = await listasRepository.findById(id);
  if (!lista) {
    throw createError('Lista acadêmica não encontrada', 404);
  }
  return lista;
}

/**
 * Exclui uma lista acadêmica
 */
async function removerLista(id, professorId) {
  const deleted = await listasRepository.deleteList(id, professorId);
  if (!deleted) {
    throw createError('Lista não encontrada ou você não tem permissão para excluí-la', 404);
  }
  return { success: true };
}

module.exports = {
  vincularProfessor,
  criarLista,
  listarPorUsuario,
  obterDetalhes,
  removerLista
};
