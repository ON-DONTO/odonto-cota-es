require('dotenv').config();
const { pool } = require('./src/config/database');

async function scan() {
  try {
    const [tables] = await pool.execute('SHOW TABLES');
    console.log('Tabelas:', tables.map(t => Object.values(t)[0]));
    
    const [cols] = await pool.execute('DESCRIBE cotacoes');
    console.log('\n--- Estrutura de cotacoes ---');
    console.table(cols);
    
    const [cols2] = await pool.execute('DESCRIBE cotacao_itens');
    console.log('\n--- Estrutura de cotacao_itens ---');
    console.table(cols2);
  } catch(e) {
    console.error('❌ Erro no scan:', e.message);
  } finally {
    await pool.end();
  }
}

scan();
