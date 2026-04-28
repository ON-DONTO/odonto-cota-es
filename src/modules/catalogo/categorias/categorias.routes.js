'use strict';

const { Router } = require('express');
const controller = require('./categorias.controller');
const { authenticate, authorize } = require('../../../middlewares/auth.middleware');

const router = Router();

// GET  /api/categorias?area_id=  — Lista categorias (opcionalmente filtradas por área)
router.get('/', controller.listar);

// GET  /api/categorias/:id       — Busca categoria por ID
router.get('/:id', controller.buscarPorId);

// POST /api/categorias           — Cria nova categoria
router.post('/', authenticate, authorize(['admin']), controller.criar);

module.exports = router;
