'use strict';

const express = require('express');
const router = express.Router();
const respostasController = require('./respostas.controller');
const { authenticate, authorize } = require('../../../middlewares/auth.middleware');

router.use(authenticate);

// Fornecedor envia resposta
router.post('/', authorize(['admin', 'fornecedor']), respostasController.responder);

// Dentista ou Admin lista respostas de uma cotação
router.get('/cotacao/:cotacaoId', authorize(['admin', 'cliente', 'aluno']), respostasController.listByCotacao);

module.exports = router;
