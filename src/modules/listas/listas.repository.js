'use strict';

const { pool } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Encontra um professor pelo código de acesso
 */
async function findTeacherByCode(code) {
  const [rows] = await pool.query(
    'SELECT id, nome, email FROM users WHERE codigo_acesso = ? AND tipo = "professor"',
    [code]
  );
  return rows[0];
}

/**
 * Vincula um aluno a um professor
 */
async function linkStudentToTeacher(studentId, teacherId) {
  await pool.query(
    'UPDATE users SET professor_id = ? WHERE id = ? AND tipo = "aluno"',
    [teacherId, studentId]
  );
}

/**
 * Cria o cabeçalho da lista acadêmica
 */
async function createList({ professorId, nome, descricao, semestre }) {
  const id = uuidv4();
  await pool.query(
    'INSERT INTO listas_academicas (id, professor_id, nome, descricao, semestre) VALUES (?, ?, ?, ?, ?)',
    [id, professorId, nome, descricao, semestre]
  );
  return id;
}

/**
 * Adiciona itens à lista acadêmica
 */
async function addListItems(listaId, items) {
  // items: [{ produto_id, quantidade, observacao }]
  const query = `
    INSERT INTO lista_academica_itens (id, lista_id, produto_id, quantidade, observacao)
    VALUES (?, ?, ?, ?, ?)
  `;
  for (const item of items) {
    const itemId = uuidv4();
    await pool.query(query, [
      itemId,
      listaId,
      item.produto_id,
      item.quantidade || 1,
      item.observacao || null
    ]);
  }
}

/**
 * Busca todas as listas de um professor
 */
async function findByProfessorId(professorId) {
  const [rows] = await pool.query(
    'SELECT * FROM listas_academicas WHERE professor_id = ? ORDER BY created_at DESC',
    [professorId]
  );
  return rows;
}

/**
 * Busca todas as listas do professor vinculado a um aluno
 */
async function findByStudentId(studentId) {
  // 1. Obter o professor_id do aluno
  const [userRows] = await pool.query(
    'SELECT professor_id FROM users WHERE id = ? AND tipo = "aluno"',
    [studentId]
  );
  
  if (!userRows[0] || !userRows[0].professor_id) {
    return { teacher: null, lists: [] };
  }

  const teacherId = userRows[0].professor_id;

  // 2. Obter informações do professor
  const [teacherRows] = await pool.query(
    'SELECT nome, email FROM users WHERE id = ?',
    [teacherId]
  );

  // 3. Obter as listas
  const [lists] = await pool.query(
    'SELECT * FROM listas_academicas WHERE professor_id = ? ORDER BY created_at DESC',
    [teacherId]
  );

  return {
    teacher: teacherRows[0] ? { id: teacherId, ...teacherRows[0] } : null,
    lists
  };
}

/**
 * Busca uma lista acadêmica por ID com seus itens detalhados
 */
async function findById(id) {
  // Cabeçalho da lista
  const [listRows] = await pool.query(
    `SELECT l.*, u.nome as professor_nome 
     FROM listas_academicas l 
     JOIN users u ON l.professor_id = u.id 
     WHERE l.id = ?`,
    [id]
  );

  if (!listRows[0]) return null;

  // Itens da lista com detalhes do produto
  const [itemRows] = await pool.query(
    `SELECT i.id, i.produto_id, i.quantidade, i.observacao, p.nome as produto_nome, p.marca as produto_marca
     FROM lista_academica_itens i
     JOIN produtos p ON i.produto_id = p.id
     WHERE i.lista_id = ?`,
    [id]
  );

  return {
    ...listRows[0],
    itens: itemRows
  };
}

/**
 * Exclui uma lista (os itens são apagados em cascata pela FK)
 */
async function deleteList(id, professorId) {
  const [result] = await pool.query(
    'DELETE FROM listas_academicas WHERE id = ? AND professor_id = ?',
    [id, professorId]
  );
  return result.affectedRows > 0;
}

/**
 * Desvincula um aluno de qualquer professor
 */
async function unlinkStudent(studentId) {
  const [result] = await pool.query(
    'UPDATE users SET professor_id = NULL WHERE id = ? AND tipo = "aluno"',
    [studentId]
  );
  return result.affectedRows > 0;
}

/**
 * Busca todos os alunos vinculados a um professor
 */
async function findStudentsByProfessorId(professorId) {
  const [rows] = await pool.query(
    'SELECT id, nome, email FROM users WHERE professor_id = ? AND tipo = "aluno" ORDER BY nome ASC',
    [professorId]
  );
  return rows;
}

/**
 * Desvincula um aluno de um professor específico (segurança adicional)
 */
async function unlinkStudentByProfessor(studentId, professorId) {
  const [result] = await pool.query(
    'UPDATE users SET professor_id = NULL WHERE id = ? AND professor_id = ? AND tipo = "aluno"',
    [studentId, professorId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  findTeacherByCode,
  linkStudentToTeacher,
  createList,
  addListItems,
  findByProfessorId,
  findByStudentId,
  findById,
  deleteList,
  unlinkStudent,
  findStudentsByProfessorId,
  unlinkStudentByProfessor
};
