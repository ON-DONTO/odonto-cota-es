require('dotenv').config();
const { pool } = require('./src/config/database');

async function migrate() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('🚀 Iniciando migração do banco de dados...');

    // 1. Atualizar a tabela de produtos
    console.log('--- Atualizando tabela de produtos ---');
    const [cols] = await connection.query('SHOW COLUMNS FROM produtos');
    const colNames = cols.map(c => c.Field);

    if (!colNames.includes('imagem_url')) {
      await connection.query('ALTER TABLE produtos ADD COLUMN imagem_url VARCHAR(255) AFTER descricao');
      console.log('✅ Coluna imagem_url adicionada.');
    }

    if (!colNames.includes('marca')) {
      await connection.query('ALTER TABLE produtos ADD COLUMN marca VARCHAR(100) AFTER nome');
      console.log('✅ Coluna marca adicionada.');
    }

    // 2. Tabela de Cotações (Cabeçalho)
    console.log('--- Criando tabelas de cotação ---');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cotacoes (
        id CHAR(36) NOT NULL PRIMARY KEY,
        dentista_id CHAR(36) NOT NULL,
        status ENUM('aberta', 'em_analise', 'finalizada', 'cancelada') DEFAULT 'aberta',
        observacoes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_cotacao_dentista FOREIGN KEY (dentista_id) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabela cotacoes pronta.');

    // 3. Tabela de Itens da Cotação
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cotacao_itens (
        id CHAR(36) NOT NULL PRIMARY KEY,
        cotacao_id CHAR(36) NOT NULL,
        produto_id CHAR(36) NOT NULL,
        quantidade INT NOT NULL DEFAULT 1,
        CONSTRAINT fk_item_cotacao FOREIGN KEY (cotacao_id) REFERENCES cotacoes(id) ON DELETE CASCADE,
        CONSTRAINT fk_item_produto FOREIGN KEY (produto_id) REFERENCES produtos(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabela cotacao_itens pronta.');

    // 4. Tabela de Respostas dos Fornecedores
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cotacao_respostas (
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabela cotacao_respostas pronta.');

    // 5. Tabela de Itens da Resposta (Preços individuais)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cotacao_resposta_itens (
        id CHAR(36) NOT NULL PRIMARY KEY,
        resposta_id CHAR(36) NOT NULL,
        produto_id CHAR(36) NOT NULL,
        tem_produto TINYINT(1) DEFAULT 1,
        preco_unitario DECIMAL(10,2) DEFAULT 0.00,
        observacao_item TEXT,
        CONSTRAINT fk_res_item_pai FOREIGN KEY (resposta_id) REFERENCES cotacao_respostas(id) ON DELETE CASCADE,
        CONSTRAINT fk_res_item_prod FOREIGN KEY (produto_id) REFERENCES produtos(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabela cotacao_resposta_itens pronta.');

    console.log('\n✨ Migração concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

migrate();
