'use strict';

const express = require('express');
const router = express.Router();
const listasController = require('./listas.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

router.use(authenticate);

// Vinculação de Aluno a Professor pelo código
router.post('/vincular', authorize(['aluno', 'admin']), listasController.vincular);

// Criar lista acadêmica (apenas Professor)
router.post('/', authorize(['professor', 'admin']), listasController.criar);

// Obter todas as listas do usuário (professor vê as suas, aluno vê as do seu professor vinculado)
router.get('/', authorize(['professor', 'aluno', 'admin']), listasController.listar);

// Visualizar detalhes de uma lista específica
router.get('/:id', authorize(['professor', 'aluno', 'admin']), listasController.visualizar);

// Excluir lista acadêmica (apenas Professor)
router.delete('/:id', authorize(['professor', 'admin']), listasController.excluir);

module.exports = router;
