'use strict';

const usersRepository = require('./users.repository');

async function listAll() {
  return await usersRepository.findAll();
}

async function deleteUser(id) {
  // Evitar que o admin se auto-exclua ou que haja problemas de integridade (poderia ser tratado com FKs)
  await usersRepository.remove(id);
}

module.exports = {
  listAll,
  deleteUser
};
