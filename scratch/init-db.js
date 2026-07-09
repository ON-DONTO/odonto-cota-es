require('dotenv').config();
const { pool } = require('../src/config/database');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const marcasMaster = ["3M", "FGM", "Angelus", "Ivoclar", "Dentsply Sirona", "Kulzer", "Maquira", "Coltene", "Ultradent", "Biodinamica", "DFL", "KG Sorensen", "Microdont", "American Burrs", "Morelli", "Orthometric", "VDW", "Septodont", "Vigodent", "Zhermack"];

const areas = [
  {
    nome: "Dentística e Estética",
    categorias: ["Resina A1", "Resina A2", "Resina A3", "Resina B1", "Resina Bulk Fill", "Adesivo Universal", "Ácido Fosfórico", "Clareador Caseiro 10%", "Clareador 16%", "Clareador 22%", "Pasta de Polimento", "Tira de Lixa", "Matriz de Aço"]
  },
  {
    nome: "Endodontia",
    categorias: ["Lima K-File 21mm", "Lima K-File 25mm", "Lima Hedstroem", "Lima Rotatória", "Lima Reciprocante", "Cimento Endodôntico", "Hipoclorito 2.5%", "EDTA 17%", "Cones de Guta .02", "Cones de Guta .04"]
  },
  {
    nome: "Cirurgia e Implantodontia",
    categorias: ["Fórceps Adulto", "Alavanca Seladin", "Cabo de Bisturi", "Lâmina de Bisturi", "Fio de Sutura Nylon", "Fio de Sutura Seda", "Esponja Hemostática", "Implante CM", "Componente Protético"]
  },
  {
    nome: "Ortodontia",
    categorias: ["Kit Bracket Metálico", "Kit Bracket Cerâmico", "Arco NiTi .014", "Arco NiTi .016", "Arco Aço .018", "Elástico Corrente", "Elástico Intraoral"]
  },
  {
    nome: "Prótese e Moldagem",
    categorias: ["Alginato", "Silicone de Adição (Kit)", "Silicone de Condensação", "Cimento Resinoso", "Cimento Provisório", "Pino de Fibra de Vidro", "Gesso Pedra"]
  },
  {
    nome: "Biossegurança e Descartáveis",
    categorias: ["Luva de Látex", "Luva de Nitrilo", "Máscara Tripla", "Touca Descartável", "Sugador Flexível", "Algodão Rolete", "Gaze Estéril", "Avental Descartável"]
  },
  {
    nome: "Anestésicos",
    categorias: ["Lidocaína 2%", "Mepivacaína 2%", "Articaína 4%", "Anestésico Tópico"]
  }
];

async function init() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('✅ Conectado ao TiDB Cloud na base: ' + process.env.DB_NAME);

    // 1. Criar tabelas base do schema.sql
    console.log('📖 Criando tabelas base...');
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Remover criação e uso de banco de dados do SQL para rodar na base conectada
    schemaSql = schemaSql.replace(/CREATE DATABASE[\s\S]*?USE\s+\w+;/gi, '');

    const queries = schemaSql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    for (const query of queries) {
      await connection.query(query);
    }
    console.log('✅ Tabelas base criadas.');

    // 2. Criar tabelas e colunas adicionais das migrações
    console.log('⏳ Executando migrações adicionais...');
    const migrations = [
      `ALTER TABLE produtos ADD COLUMN IF NOT EXISTS imagem_url VARCHAR(255) AFTER descricao`,
      `ALTER TABLE produtos ADD COLUMN IF NOT EXISTS marca VARCHAR(100) AFTER nome`,
      `CREATE TABLE IF NOT EXISTS cotacoes (
        id CHAR(36) NOT NULL PRIMARY KEY,
        dentista_id CHAR(36) NOT NULL,
        status ENUM('aberta', 'em_analise', 'finalizada', 'cancelada') DEFAULT 'aberta',
        observacoes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_cotacao_dentista FOREIGN KEY (dentista_id) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      `CREATE TABLE IF NOT EXISTS cotacao_itens (
        id CHAR(36) NOT NULL PRIMARY KEY,
        cotacao_id CHAR(36) NOT NULL,
        produto_id CHAR(36) NOT NULL,
        quantidade INT NOT NULL DEFAULT 1,
        CONSTRAINT fk_item_cotacao FOREIGN KEY (cotacao_id) REFERENCES cotacoes(id) ON DELETE CASCADE,
        CONSTRAINT fk_item_produto FOREIGN KEY (produto_id) REFERENCES produtos(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      `CREATE TABLE IF NOT EXISTS cotacao_respostas (
        id CHAR(36) NOT NULL PRIMARY KEY,
        cotacao_id CHAR(36) NOT NULL,
        fornecedor_id CHAR(36) NOT NULL,
        status ENUM('pendente', 'enviada', 'aceita', 'recusada') DEFAULT 'pendente',
        valor_total DECIMAL(10,2) DEFAULT 0.00,
        observacoes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_res_cotacao FOREIGN KEY (cotacao_id) REFERENCES cotacoes(id) ON DELETE CASCADE,
        CONSTRAINT fk_res_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      `CREATE TABLE IF NOT EXISTS cotacao_resposta_itens (
        id CHAR(36) NOT NULL PRIMARY KEY,
        resposta_id CHAR(36) NOT NULL,
        produto_id CHAR(36) NOT NULL,
        tem_produto TINYINT(1) DEFAULT 1,
        preco_unitario DECIMAL(10,2) DEFAULT 0.00,
        observacao_item TEXT,
        CONSTRAINT fk_res_item_pai FOREIGN KEY (resposta_id) REFERENCES cotacao_respostas(id) ON DELETE CASCADE,
        CONSTRAINT fk_res_item_prod FOREIGN KEY (produto_id) REFERENCES produtos(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    ];

    for (const mig of migrations) {
      try {
        await connection.query(mig);
      } catch (e) {
        if (!e.message.includes('already exists') && !e.message.includes('Duplicate')) {
          console.warn('⚠️ Alerta na migração:', e.message);
        }
      }
    }
    console.log('✅ Migrações concluídas.');

    // 3. Cadastrar Usuários de Teste
    console.log('🌱 Cadastrando usuários de teste...');
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);

    const testUsers = [
      { nome: 'Dentista de Teste', email: 'dentista@teste.com', tipo: 'cliente' },
      { nome: 'Dental Sorriso (Fornecedor)', email: 'fornecedor@teste.com', tipo: 'fornecedor' },
      { nome: 'Odonto Distribuidora', email: 'vendas@odonto.com', tipo: 'fornecedor' }
    ];

    for (const u of testUsers) {
      const [exists] = await connection.query('SELECT id FROM users WHERE email = ?', [u.email]);
      if (exists.length === 0) {
        await connection.query(
          'INSERT INTO users (id, nome, email, senha, tipo) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), u.nome, u.email, password, u.tipo]
        );
        console.log(`✅ Usuário criado: ${u.nome} (${u.email})`);
      } else {
        console.log(`ℹ️ Usuário já existe: ${u.email}`);
      }
    }

    // 4. Semear o Catálogo (seedMaster)
    console.log('🧹 Limpando catálogo antigo se houver...');
    await connection.query('DELETE FROM produtos');
    await connection.query('DELETE FROM categorias');
    await connection.query('DELETE FROM areas');

    console.log('🌱 Populando catálogo de produtos...');
    let totalProd = 0;
    for (const a of areas) {
      const areaId = uuidv4();
      await connection.query('INSERT INTO areas (id, nome, ativo) VALUES (?, ?, 1)', [areaId, a.nome]);
      
      for (const catNome of a.categorias) {
        const catId = uuidv4();
        await connection.query('INSERT INTO categorias (id, nome, area_id) VALUES (?, ?, ?)', [catId, catNome, areaId]);
        
        // Criar produtos com marcas aleatórias
        const numMarcas = Math.floor(Math.random() * 3) + 3;
        const marcasEscolhidas = [...marcasMaster].sort(() => 0.5 - Math.random()).slice(0, numMarcas);

        for (const m of marcasEscolhidas) {
          const prodId = uuidv4();
          const nomeFinal = `${catNome} - ${m}`;
          await connection.query(
            'INSERT INTO produtos (id, nome, marca, descricao, categoria_id, ativo, imagem_url) VALUES (?, ?, ?, ?, ?, 1, ?)',
            [prodId, nomeFinal, m, `Alta qualidade garantida pela ${m}. Ideal para sua clínica.`, catId, `https://placehold.co/400x400?text=${encodeURIComponent(nomeFinal)}`]
          );
          totalProd++;
        }
      }
      console.log(`✅ Área ${a.nome} populada.`);
    }
    console.log(`✨ Catálogo semeado! ${totalProd} produtos criados.`);

  } catch (error) {
    console.error('❌ Erro na inicialização:', error);
  } finally {
    if (connection) connection.release();
    await pool.end();
    console.log('🔌 Conexão encerrada.');
  }
}

init();
