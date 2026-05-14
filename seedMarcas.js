require('dotenv').config();
const { pool } = require('./src/config/database');
const { v4: uuidv4 } = require('uuid');

const marcas = ["3M", "FGM", "Angelus", "Ivoclar", "Dentsply Sirona", "Kulzer", "Maquira", "Coltene", "Ultradent", "Biodinamica"];

const categoriasBase = [
  {
    area: "Dentística e Estética",
    categorias: [
      {
        nome: "Resina Composta A2",
        produtos: [
          { nome: "Resina Filtek Z350 XT A2", marca: "3M", desc: "Resina universal com nanotecnologia." },
          { nome: "Resina Vittra APS A2", marca: "FGM", desc: "Resina premium com sistema de carga esferoidal." },
          { nome: "Resina Opallis A2", marca: "FGM", desc: "Resina micro-híbrida para dentes anteriores e posteriores." },
          { nome: "Resina Empress Direct A2", marca: "Ivoclar", desc: "Resina altamente estética de nível superior." },
          { nome: "Resina Charisma Diamond A2", marca: "Kulzer", desc: "Resina com baixo estresse de contração." }
        ]
      },
      {
        nome: "Adesivo Universal",
        produtos: [
          { nome: "Single Bond Universal", marca: "3M", desc: "Adesivo de frasco único para todas as técnicas." },
          { nome: "Ambar Universal APS", marca: "FGM", desc: "Adesivo com sistema APS para alta performance." },
          { nome: "Tetric N-Bond Universal", marca: "Ivoclar", desc: "Adesivo universal monocomponente." }
        ]
      }
    ]
  },
  {
    area: "Endodontia",
    categorias: [
      {
        nome: "Sistemas Mecanizados (25mm)",
        produtos: [
          { nome: "Limas Protaper Gold", marca: "Dentsply Sirona", desc: "Sistema rotatório de alta flexibilidade." },
          { nome: "Wave One Gold Primary", marca: "Dentsply Sirona", desc: "Sistema reciprocante de lima única." },
          { nome: "Reciproc Blue R25", marca: "VDW", desc: "Limas reciprocantes com tratamento térmico azul." },
          { nome: "ProDesign Logic 25/06", marca: "Easy", desc: "Limas rotatórias de NiTi com memória controlada." }
        ]
      }
    ]
  },
  {
    area: "Anestésicos",
    categorias: [
      {
        nome: "Lidocaína 2% com Epinefrina",
        produtos: [
          { nome: "Alphacaine 1:100.000", marca: "DFL", desc: "Anestésico injetável padrão ouro." },
          { nome: "Lidostesim 2%", marca: "Dentsply", desc: "Cloreto de Lidocaína com Epinefrina." },
          { nome: "Nova DFL Lidocaína", marca: "DFL", desc: "Opção econômica e eficiente." }
        ]
      }
    ]
  },
  {
    area: "Moldagem",
    categorias: [
      {
        nome: "Silicone de Adição",
        produtos: [
          { nome: "Express XT", marca: "3M", desc: "Silicone de adição de alta precisão." },
          { nome: "Perfit Putty/Light", marca: "Maquira", desc: "Excelente custo-benefício em moldagem." },
          { nome: "Virtual Putty", marca: "Ivoclar", desc: "Silicone de adição hidrofílico." },
          { nome: "Panasil Initial Contact", marca: "Kettenbach", desc: "Alta hidrofilia imediata." }
        ]
      }
    ]
  }
];

// Helper para gerar variações de brocas
const gerarBrocas = () => {
  const marcasBrocas = ["American Burrs", "FG", "KG Sorensen", "Microdont"];
  const modelos = ["1011", "1012", "1014", "2131", "3118", "4138"];
  const itens = [];
  
  marcasBrocas.forEach(m => {
    modelos.forEach(mod => {
      itens.push({
        nome: `Ponta Diamantada ${mod}`,
        marca: m,
        desc: `Ponta de alta rotação modelo ${mod}.`
      });
    });
  });
  return itens;
};

async function seedMarcas() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('🧹 Limpando produtos para o novo seed de marcas...');
    await connection.query('DELETE FROM produtos');
    await connection.query('DELETE FROM categorias');
    await connection.query('DELETE FROM areas');

    // Adicionar Brocas geradas
    categoriasBase.push({
      area: "Brocas e Pontas Diamantadas",
      categorias: [
        { nome: "Pontas Diamantadas", produtos: gerarBrocas() }
      ]
    });

    console.log('🌱 Populando com diversas marcas e opções...');

    for (const a of categoriasBase) {
      const areaId = uuidv4();
      await connection.query('INSERT INTO areas (id, nome, ativo) VALUES (?, ?, 1)', [areaId, a.area]);
      
      for (const c of a.categorias) {
        const catId = uuidv4();
        await connection.query('INSERT INTO categorias (id, nome, area_id) VALUES (?, ?, ?)', [catId, c.nome, areaId]);
        
        for (const p of c.produtos) {
          await connection.query(
            'INSERT INTO produtos (id, nome, marca, descricao, categoria_id, ativo, imagem_url) VALUES (?, ?, ?, ?, ?, 1, ?)',
            [uuidv4(), p.nome, p.marca, p.desc, catId, `https://placehold.co/400x400?text=${encodeURIComponent(p.nome)}`]
          );
        }
      }
    }

    console.log('✨ Seed de Marcas concluído! Diversas opções criadas para cada categoria.');

  } catch (error) {
    console.error('❌ Erro no seed:', error);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

seedMarcas();
