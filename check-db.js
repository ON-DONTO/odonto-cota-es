const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'odonto_cota'
  });

  console.log('=== ESTRUTURA DA TABELA USERS ===');
  const [cols] = await conn.query('DESCRIBE users');
  cols.forEach(c => console.log(`  ${c.Field} | ${c.Type} | Null:${c.Null} | Default:${c.Default}`));

  console.log('\n=== USUARIOS CADASTRADOS ===');
  const [users] = await conn.query('SELECT id, nome, email, tipo, professor_id, codigo_acesso FROM users LIMIT 10');
  users.forEach(u => console.log(JSON.stringify(u)));

  await conn.end();
}

main().catch(e => console.error('ERRO:', e.message));
