require('dotenv').config();
const { pool } = require('../src/config/database');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const marcasMaster = ["3M", "FGM", "Angelus", "Ivoclar", "Dentsply Sirona", "Kulzer", "Maquira", "Coltene", "Ultradent", "Biodinamica", "DFL", "KG Sorensen", "Microdont", "American Burrs", "Morelli", "Orthometric", "VDW", "Septodont", "Vigodent", "Zhermack"];

const areas = [
  { nome: "Dentística e Estética", categorias: ["Resina A1", "Resina A2", "Resina A3", "Resina B1", "Resina Bulk Fill", "Adesivo Universal", "Ácido Fosfórico", "Clareador Caseiro 10%", "Clareador 16%", "Clareador 22%", "Pasta de Polimento", "Tira de Lixa", "Matriz de Aço"] },
  { nome: "Endodontia", categorias: ["Lima K-File 21mm", "Lima K-File 25mm", "Lima Hedstroem", "Lima Rotatória", "Lima Reciprocante", "Cimento Endodôntico", "Hipoclorito 2.5%", "EDTA 17%", "Cones de Guta .02", "Cones de Guta .04"] },
  { nome: "Cirurgia e Implantodontia", categorias: ["Fórceps Adulto", "Alavanca Seladin", "Cabo de Bisturi", "Lâmina de Bisturi", "Fio de Sutura Nylon", "Fio de Sutura Seda", "Esponja Hemostática", "Implante CM", "Componente Protético"] },
  { nome: "Ortodontia", categorias: ["Kit Bracket Metálico", "Kit Bracket Cerâmico", "Arco NiTi .014", "Arco NiTi .016", "Arco Aço .018", "Elástico Corrente", "Elástico Intraoral"] },
  { nome: "Prótese e Moldagem", categorias: ["Alginato", "Silicone de Adição (Kit)", "Silicone de Condensação", "Cimento Resinoso", "Cimento Provisório", "Pino de Fibra de Vidro", "Gesso Pedra"] },
  { nome: "Biossegurança e Descartáveis", categorias: ["Luva de Látex", "Luva de Nitrilo", "Máscara Tripla", "Touca Descartável", "Sugador Flexível", "Algodão Rolete", "Gaze Estéril", "Avental Descartável"] },
  { nome: "Anestésicos", categorias: ["Lidocaína 2%", "Mepivacaína 2%", "Articaína 4%", "Anestésico Tópico"] }
];

async function init() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('✅ Conectado ao TiDB Cloud na base: ' + process.env.DB_NAME);

    // 1. Criar tabelas base
    console.log('📖 Criando tabelas base...');
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) NOT NULL PRIMARY KEY,
        nome VARCHAR(120) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        tipo ENUM('admin', 'cliente', 'fornecedor', 'professor', 'aluno') NOT NULL DEFAULT 'cliente',
        codigo_acesso VARCHAR(20) DEFAULT NULL,
        professor_id CHAR(36) DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS areas (
        id CHAR(36) NOT NULL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL UNIQUE,
        descricao TEXT,
        ativo TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS categorias (
        id CHAR(36) NOT NULL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        area_id CHAR(36) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_categorias_area FOREIGN KEY (area_id) REFERENCES areas(id),
        UNIQUE KEY uq_categoria_area (nome, area_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS produtos (
        id CHAR(36) NOT NULL PRIMARY KEY,
        nome VARCHAR(150) NOT NULL,
        marca VARCHAR(100) DEFAULT NULL,
        descricao TEXT,
        imagem_url VARCHAR(255) DEFAULT NULL,
        categoria_id CHAR(36) NOT NULL,
        ativo TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_produtos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id),
        UNIQUE KEY uq_produto_categoria (nome, categoria_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS cotacoes (
        id CHAR(36) NOT NULL PRIMARY KEY,
        dentista_id CHAR(36) NOT NULL,
        status ENUM('aberta', 'em_analise', 'finalizada', 'cancelada') DEFAULT 'aberta',
        observacoes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_cotacao_dentista FOREIGN KEY (dentista_id) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS cotacao_itens (
        id CHAR(36) NOT NULL PRIMARY KEY,
        cotacao_id CHAR(36) NOT NULL,
        produto_id CHAR(36) NOT NULL,
        quantidade INT NOT NULL DEFAULT 1,
        CONSTRAINT fk_item_cotacao FOREIGN KEY (cotacao_id) REFERENCES cotacoes(id) ON DELETE CASCADE,
        CONSTRAINT fk_item_produto FOREIGN KEY (produto_id) REFERENCES produtos(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS cotacao_resposta_itens (
        id CHAR(36) NOT NULL PRIMARY KEY,
        resposta_id CHAR(36) NOT NULL,
        produto_id CHAR(36) NOT NULL,
        tem_produto TINYINT(1) DEFAULT 1,
        preco_unitario DECIMAL(10,2) DEFAULT 0.00,
        observacao_item TEXT,
        CONSTRAINT fk_res_item_pai FOREIGN KEY (resposta_id) REFERENCES cotacao_respostas(id) ON DELETE CASCADE,
        CONSTRAINT fk_res_item_prod FOREIGN KEY (produto_id) REFERENCES produtos(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    ];

    for (const sql of tables) {
      await connection.query(sql);
    }
    console.log('✅ Tabelas criadas com sucesso.');

    // 2. Usuários de teste
    console.log('🌱 Cadastrando usuários de teste...');
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);
    const testUsers = [
      { nome: 'Dentista de Teste', email: 'dentista@teste.com', tipo: 'cliente' },
      { nome: 'Dental Sorriso', email: 'fornecedor@teste.com', tipo: 'fornecedor' },
      { nome: 'Odonto Distribuidora', email: 'vendas@odonto.com', tipo: 'fornecedor' }
    ];
    for (const u of testUsers) {
      const [exists] = await connection.query('SELECT id FROM users WHERE email = ?', [u.email]);
      if (exists.length === 0) {
        await connection.query('INSERT INTO users (id, nome, email, senha, tipo) VALUES (?, ?, ?, ?, ?)', [uuidv4(), u.nome, u.email, password, u.tipo]);
        console.log(`✅ Criado: ${u.email}`);
      } else {
        console.log(`ℹ️ Já existe: ${u.email}`);
      }
    }

    // 3. Catálogo de produtos
    console.log('🌱 Populando catálogo...');
    await connection.query('DELETE FROM produtos');
    await connection.query('DELETE FROM categorias');
    await connection.query('DELETE FROM areas');
    let totalProd = 0;
    for (const a of areas) {
      const areaId = uuidv4();
      await connection.query('INSERT INTO areas (id, nome, ativo) VALUES (?, ?, 1)', [areaId, a.nome]);
      for (const catNome of a.categorias) {
        const catId = uuidv4();
        await connection.query('INSERT INTO categorias (id, nome, area_id) VALUES (?, ?, ?)', [catId, catNome, areaId]);
        const marcasEscolhidas = [...marcasMaster].sort(() => 0.5 - Math.random()).slice(0, 4);
        for (const m of marcasEscolhidas) {
          const nomeFinal = `${catNome} - ${m}`;
          await connection.query('INSERT INTO produtos (id, nome, marca, descricao, categoria_id, ativo, imagem_url) VALUES (?, ?, ?, ?, ?, 1, ?)',
            [uuidv4(), nomeFinal, m, `Alta qualidade garantida pela ${m}.`, catId, `https://placehold.co/400x400?text=${encodeURIComponent(nomeFinal)}`]);
          totalProd++;
        }
      }
      console.log(`✅ Área ${a.nome} populada.`);
    }
    console.log(`✨ ${totalProd} produtos criados!`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) connection.release();
    await pool.end();
    console.log('🔌 Encerrado.');
  }
}

init();
