'use strict';

const { Router } = require('express');
const controller = require('./produtos.controller');
const { authenticate, authorize } = require('../../../middlewares/auth.middleware');

const router = Router();

// GET    /api/produtos?categoria_id=&ativo=  — Lista produtos (filtros opcionais)
router.get('/', controller.listar);

// GET    /api/produtos/:id                  — Busca produto por ID
router.get('/:id', controller.buscarPorId);

// POST   /api/produtos                      — Cria novo produto
router.post('/', authenticate, authorize(['admin']), controller.criar);

// PATCH  /api/produtos/:id/ativar           — Ativa produto
router.patch('/:id/ativar', authenticate, authorize(['admin']), controller.ativar);

// PATCH  /api/produtos/:id/desativar        — Desativa produto
router.patch('/:id/desativar', authenticate, authorize(['admin']), controller.desativar);

module.exports = router;
