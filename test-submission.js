require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const cotacoesService = require('./src/modules/catalogo/cotacoes/cotacoes.service');
const { pool } = require('./src/config/database');

async function test() {
  try {
    // 1. Pega um dentista e um produto real do banco
    const [users] = await pool.execute('SELECT id FROM users WHERE tipo = "cliente" LIMIT 1');
    const [prods] = await pool.execute('SELECT id FROM produtos LIMIT 1');
    
    if (users.length === 0 || prods.length === 0) {
      console.log('❌ Preciso de pelo menos um cliente e um produto no banco para testar.');
      process.exit(1);
    }

    const dentista_id = users[0].id;
    const produto_id = prods[0].id;

    console.log(`🧪 Testando envio para Dentista: ${dentista_id} e Produto: ${produto_id}`);

    const result = await cotacoesService.create({
      dentista_id,
      observacoes: 'Teste de depuração',
      itens: [
        { produto_id, quantidade: 2 }
      ]
    });

    console.log('✅ Cotação enviada com SUCESSO! ID:', result.id);
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
    if (error.sql) console.error('SQL Query:', error.sql);
  } finally {
    await pool.end();
  }
}

test();
