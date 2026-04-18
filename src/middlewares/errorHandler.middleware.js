'use strict';

/**
 * Middleware de tratamento de erros global.
 * Deve ser registrado como último middleware no app.
 */
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.url} →`, err.message);

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'Erro interno do servidor.';

  return res.status(status).json({ error: message });
}

module.exports = { errorHandler };
