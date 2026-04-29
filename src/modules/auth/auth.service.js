'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');
const { createError } = require('../../utils/createError');

/**
 * Serviço de Login
 */
async function login(email, password) {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    throw createError('Email ou senha inválidos', 401);
  }

  const isMatch = await bcrypt.compare(password, user.senha);
  if (!isMatch) {
    throw createError('Email ou senha inválidos', 401);
  }

  // Gera o token
  const payload = {
    id: user.id,
    email: user.email,
    tipo: user.tipo
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

  return {
    token,
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo
    }
  };
}

/**
 * Serviço de Registro
 */
async function register(userData) {
  const { nome, email, senha, tipo } = userData;

  // Verifica se o email já existe
  const existingUser = await authRepository.findByEmail(email);
  if (existingUser) {
    throw createError('E-mail já está em uso', 400);
  }

  // Validação básica de tipo (impede criação de admin via rota pública)
  const allowedTypes = ['cliente', 'fornecedor'];
  const finalTipo = allowedTypes.includes(tipo) ? tipo : 'cliente';

  // Hash da senha
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(senha, salt);

  const userToCreate = {
    nome,
    email,
    senha: hashedPassword,
    tipo: finalTipo
  };

  const newUser = await authRepository.create(userToCreate);
  return newUser;
}

module.exports = {
  login,
  register
};
