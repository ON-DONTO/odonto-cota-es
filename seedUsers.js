require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./src/config/database');
const { v4: uuidv4 } = require('uuid');

async function seedUsers() {
  try {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);

    const users = [
      { nome: 'Dentista de Teste', email: 'dentista@teste.com', tipo: 'cliente' },
      { nome: 'Dental Sorriso (Fornecedor)', email: 'fornecedor@teste.com', tipo: 'fornecedor' },
      { nome: 'Odonto Distribuidora', email: 'vendas@odonto.com', tipo: 'fornecedor' }
    ];

    console.log('🌱 Criando usuários de teste...');

    for (const u of users) {
      const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [u.email]);
      if (exists.length === 0) {
        await pool.query(
          'INSERT INTO users (id, nome, email, senha, tipo) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), u.nome, u.email, password, u.tipo]
        );
        console.log(`✅ Usuário criado: ${u.nome} (${u.tipo})`);
      } else {
        console.log(`ℹ️ Usuário já existe: ${u.email}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

seedUsers();
