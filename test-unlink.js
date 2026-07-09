const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  // 1. Login como aluno
  console.log('1. Fazendo login como aluno dotti...');
  const loginRes = await request({
    hostname: '127.0.0.1', port: 3000,
    path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'dotti@dotti', senha: '123' });
  
  console.log('   Status:', loginRes.status);
  console.log('   Body:', JSON.stringify(loginRes.body));
  
  if (loginRes.status !== 200) {
    console.log('\n❌ Login falhou. Tentando com outras senhas comuns...');
    
    const senhas = ['123456', '123', 'dotti', 'password', '12345678', 'senha123'];
    for (const senha of senhas) {
      const r = await request({
        hostname: '127.0.0.1', port: 3000,
        path: '/api/auth/login', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { email: 'dotti@dotti', senha });
      console.log(`   Senha "${senha}": status ${r.status}`);
      if (r.status === 200) {
        console.log('   ✅ Senha correta:', senha);
        break;
      }
    }
    return;
  }

  const token = loginRes.body.token;
  const authHeader = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // 2. Verificar listas do aluno
  console.log('\n2. Verificando professor vinculado...');
  const listRes = await request({
    hostname: '127.0.0.1', port: 3000,
    path: '/api/listas', method: 'GET',
    headers: authHeader
  });
  console.log('   Status:', listRes.status);
  console.log('   Teacher:', listRes.body.teacher?.nome);

  // 3. Desvincular professor
  console.log('\n3. Tentando desvincular professor...');
  const unlinkRes = await request({
    hostname: '127.0.0.1', port: 3000,
    path: '/api/listas/desvincular', method: 'POST',
    headers: authHeader
  });
  console.log('   Status:', unlinkRes.status);
  console.log('   Body:', JSON.stringify(unlinkRes.body));
  
  if (unlinkRes.status === 200) {
    console.log('\n✅ Desvincular funcionou!');
    
    // 4. Re-vincular para não deixar o banco desconfigurado
    console.log('\n4. Re-vinculando professor para restaurar estado...');
    const relinkRes = await request({
      hostname: '127.0.0.1', port: 3000,
      path: '/api/listas/vincular', method: 'POST',
      headers: authHeader
    }, { codigo: 'PROF-9FQKGM' });
    console.log('   Status:', relinkRes.status);
    console.log('   Body:', JSON.stringify(relinkRes.body));
  } else {
    console.log('\n❌ Desvincular falhou!');
  }
}

main().catch(e => console.error('ERRO:', e.message));
