'use strict';

const authService = require('./auth.service');

async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const result = await authService.login(email, senha);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    }

    const newUser = await authService.register({ nome, email, senha });
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  register
};
