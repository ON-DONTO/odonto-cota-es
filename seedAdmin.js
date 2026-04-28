require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./src/config/database');
const { v4: uuidv4 } = require('uuid');

async function seedAdmin() {
  try {
    const adminEmail = 'admin@odontocota.com.br';
    
    // Verifica se já existe
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [adminEmail]);
    if (rows.length > 0) {
      console.log('Admin já existe no banco de dados!');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    const id = uuidv4();

    const query = `
      INSERT INTO users (id, nome, email, senha, tipo)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await pool.query(query, [id, 'Administrador', adminEmail, hashedPassword, 'admin']);
    console.log('✅ Usuário Administrador criado com sucesso!');
    console.log('Email: admin@odontocota.com.br');
    console.log('Senha: 123456');

  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
  } finally {
    await pool.end();
  }
}

seedAdmin();
