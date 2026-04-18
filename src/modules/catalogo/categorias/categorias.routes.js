'use strict';

const { Router } = require('express');
const controller = require('./categorias.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');

const router = Router();

// Todas as rotas de categorias exigem autenticação JWT
router.use(authenticate);

// GET  /api/categorias?area_id=  — Lista categorias (opcionalmente filtradas por área)
router.get('/', controller.listar);

// GET  /api/categorias/:id       — Busca categoria por ID
router.get('/:id', controller.buscarPorId);

// POST /api/categorias           — Cria nova categoria
router.post('/', controller.criar);

module.exports = router;
