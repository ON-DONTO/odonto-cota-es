'use strict';

const express = require('express');
const cors = require('cors');

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const areasRoutes = require('./modules/catalogo/areas/areas.routes');
const categoriasRoutes = require('./modules/catalogo/categorias/categorias.routes');
const produtosRoutes = require('./modules/catalogo/produtos/produtos.routes');

// Middlewares
const { errorHandler } = require('./middlewares/errorHandler.middleware');

const app = express();

app.use(cors());

// ── Parsing ─────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Rotas do catálogo ────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/areas', areasRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/produtos', produtosRoutes);

// ── 404 ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// ── Error handler global ─────────────────────────────────
app.use(errorHandler);

module.exports = app;
