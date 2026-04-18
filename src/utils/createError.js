'use strict';

/**
 * Cria um objeto de erro HTTP padronizado.
 * @param {string} message - Mensagem de erro
 * @param {number} status  - Código HTTP (padrão 400)
 */
function createError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = { createError };
