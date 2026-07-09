const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1', user: 'root', password: '', database: 'odonto_cota'
  });

  // Verificar estado atual
  const [rows] = await conn.query('SELECT id, nome, professor_id FROM users WHERE email = "dotti@dotti"');
  console.log('Estado atual dotti:', rows[0]);

  // Se professor_id for null, re-vincular ao professor roberson
  if (!rows[0].professor_id) {
    const [profRows] = await conn.query('SELECT id, nome FROM users WHERE email = "roberson@gmail"');
    console.log('Professor roberson:', profRows[0]);
    
    await conn.query('UPDATE users SET professor_id = ? WHERE email = "dotti@dotti"', [profRows[0].id]);
    console.log('✅ Re-vinculado com sucesso!');
  } else {
    console.log('professor_id já existe, nenhuma ação necessária.');
  }

  await conn.end();
}
main().catch(e => console.error('ERRO:', e.message));
