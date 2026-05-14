'use strict';

const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

// Todas as rotas de gestão de usuários exigem ser ADMIN
router.use(authenticate);
router.use(authorize(['admin']));

router.get('/', usersController.list);
router.delete('/:id', usersController.remove);

module.exports = router;
