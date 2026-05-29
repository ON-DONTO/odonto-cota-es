require('dotenv').config();
const { pool } = require('../src/config/database');

async function updateImages() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('🔍 Buscando produtos sem imagem no banco...');
    
    const [produtos] = await connection.query('SELECT id, nome FROM produtos WHERE imagem_url IS NULL OR imagem_url = ""');
    
    console.log(`📋 Encontrados ${produtos.length} produtos sem imagem.`);
    
    if (produtos.length === 0) {
      console.log('✅ Todos os produtos já possuem imagem.');
      return;
    }

    let count = 0;
    for (const prod of produtos) {
      const url = `https://placehold.co/400x400?text=${encodeURIComponent(prod.nome)}`;
      await connection.query('UPDATE produtos SET imagem_url = ? WHERE id = ?', [url, prod.id]);
      count++;
    }
    
    console.log(`✨ Sucesso! ${count} produtos foram atualizados com imagens de placeholder.`);
  } catch (error) {
    console.error('❌ Erro ao atualizar imagens:', error);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

updateImages();
