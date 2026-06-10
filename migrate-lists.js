require('dotenv').config();
const { pool } = require('./src/config/database');

async function runMigration() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('🚀 Iniciando migração das tabelas acadêmicas...');

    // 1. Modificar a coluna tipo da tabela users
    console.log('--- Atualizando coluna tipo em users ---');
    await connection.query(`
      ALTER TABLE users MODIFY COLUMN tipo ENUM('admin', 'cliente', 'fornecedor', 'professor', 'aluno') NOT NULL DEFAULT 'cliente'
    `);
    console.log('✅ Coluna tipo em users atualizada.');

    // 2. Adicionar as colunas de vinculação
    const [cols] = await connection.query('SHOW COLUMNS FROM users');
    const colNames = cols.map(c => c.Field);

    if (!colNames.includes('codigo_acesso')) {
      await connection.query('ALTER TABLE users ADD COLUMN codigo_acesso VARCHAR(20) UNIQUE NULL AFTER tipo');
      console.log('✅ Coluna codigo_acesso adicionada em users.');
    }

    if (!colNames.includes('professor_id')) {
      await connection.query('ALTER TABLE users ADD COLUMN professor_id CHAR(36) NULL AFTER codigo_acesso');
      await connection.query('ALTER TABLE users ADD CONSTRAINT fk_user_professor FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE SET NULL');
      console.log('✅ Coluna professor_id e restrição adicionada em users.');
    }

    // 3. Tabela de Listas Acadêmicas
    console.log('--- Criando tabela listas_academicas ---');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS listas_academicas (
        id CHAR(36) NOT NULL PRIMARY KEY,
        professor_id CHAR(36) NOT NULL,
        nome VARCHAR(150) NOT NULL,
        descricao TEXT,
        semestre VARCHAR(20) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_lista_professor FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabela listas_academicas pronta.');

    // 4. Tabela de Itens das Listas
    console.log('--- Criando tabela lista_academica_itens ---');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS lista_academica_itens (
        id CHAR(36) NOT NULL PRIMARY KEY,
        lista_id CHAR(36) NOT NULL,
        produto_id CHAR(36) NOT NULL,
        quantidade INT NOT NULL DEFAULT 1,
        observacao VARCHAR(255) NULL,
        CONSTRAINT fk_item_lista FOREIGN KEY (lista_id) REFERENCES listas_academicas(id) ON DELETE CASCADE,
        CONSTRAINT fk_item_lista_produto FOREIGN KEY (produto_id) REFERENCES produtos(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabela lista_academica_itens pronta.');

    console.log('\n✨ Migração concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro na migração das tabelas acadêmicas:', error);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

runMigration();
