'use strict';

const { Router } = require('express');
const controller = require('./produtos.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');

const router = Router();

// Todas as rotas de produtos exigem autenticação JWT
router.use(authenticate);

// GET    /api/produtos?categoria_id=&ativo=  — Lista produtos (filtros opcionais)
router.get('/', controller.listar);

// GET    /api/produtos/:id                  — Busca produto por ID
router.get('/:id', controller.buscarPorId);

// POST   /api/produtos                      — Cria novo produto
router.post('/', controller.criar);

// PATCH  /api/produtos/:id/ativar           — Ativa produto
router.patch('/:id/ativar', controller.ativar);

// PATCH  /api/produtos/:id/desativar        — Desativa produto
router.patch('/:id/desativar', controller.desativar);

module.exports = router;
