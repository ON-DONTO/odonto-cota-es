'use strict';

const { Router } = require('express');
const controller = require('./areas.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');

const router = Router();

// AUTH TEMPORARIAMENTE DESABILITADO PARA TESTES
// router.use(authenticate);

// GET    /api/areas         — Lista todas as áreas
router.get('/', controller.listar);

// GET    /api/areas/:id     — Busca área por ID
router.get('/:id', controller.buscarPorId);

// POST   /api/areas         — Cria nova área
router.post('/', controller.criar);

// PUT    /api/areas/:id     — Atualiza área
router.put('/:id', controller.atualizar);

// PATCH  /api/areas/:id/ativar    — Ativa área
router.patch('/:id/ativar', controller.ativar);

// PATCH  /api/areas/:id/desativar — Desativa área
router.patch('/:id/desativar', controller.desativar);

module.exports = router;
