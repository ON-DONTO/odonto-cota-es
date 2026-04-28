'use strict';

const { Router } = require('express');
const controller = require('./areas.controller');
const { authenticate, authorize } = require('../../../middlewares/auth.middleware');

const router = Router();

// GET    /api/areas         — Lista todas as áreas
router.get('/', controller.listar);

// GET    /api/areas/:id     — Busca área por ID
router.get('/:id', controller.buscarPorId);

// POST   /api/areas         — Cria nova área
router.post('/', authenticate, authorize(['admin']), controller.criar);

// PUT    /api/areas/:id     — Atualiza área
router.put('/:id', authenticate, authorize(['admin']), controller.atualizar);

// PATCH  /api/areas/:id/ativar    — Ativa área
router.patch('/:id/ativar', authenticate, authorize(['admin']), controller.ativar);

// PATCH  /api/areas/:id/desativar — Desativa área
router.patch('/:id/desativar', authenticate, authorize(['admin']), controller.desativar);

module.exports = router;
