'use strict';

const express = require('express');
const router = express.Router();
const cotacoesController = require('./cotacoes.controller');
const { authenticate, authorize } = require('../../../middlewares/auth.middleware');

// Todas as rotas de cotação exigem autenticação
router.use(authenticate);

// Rota para o dentista criar cotação
router.post('/', authorize(['admin', 'cliente']), cotacoesController.create);

// Rota para o dentista ver suas próprias cotações
router.get('/minhas', authorize(['admin', 'cliente']), cotacoesController.listMinhas);

// Rota para o fornecedor ver cotações abertas
router.get('/abertas', authorize(['admin', 'fornecedor']), cotacoesController.listAbertas);

// Rota para ver detalhes de uma cotação (ambos podem ver)
router.get('/:id', cotacoesController.getDetails);

module.exports = router;
