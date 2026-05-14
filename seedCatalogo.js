require('dotenv').config();
const { pool } = require('./src/config/database');
const { v4: uuidv4 } = require('uuid');

const catalogoRaw = [
  {
    area: "Brocas e Pontas Diamantadas",
    categorias: [
      { nome: "Pontas Diamantadas Esféricas", itens: ["1011", "1012", "1013", "1014", "1015", "1016"].map(n => `Ponta Diamantada ${n}`) },
      { nome: "Pontas Diamantadas Cilíndricas", itens: ["2131", "2135", "1090", "1092"].map(n => `Ponta Diamantada ${n}`) },
      { nome: "Pontas Diamantadas Cônicas", itens: ["3118", "3168", "3195", "3203", "2200"].map(n => `Ponta Diamantada ${n}`) },
      { nome: "Brocas Carbide FG", itens: ["1/4", "1/2", "2", "4", "6", "8", "701", "702", "703"].map(n => `Broca Carbide FG ${n}`) },
      { nome: "Brocas Carbide CA", itens: ["2", "4", "6", "8"].map(n => `Broca Carbide CA ${n}`) },
      { nome: "Brocas de Zircônia", itens: ["Z01", "Z02", "Z03"].map(n => `Broca p/ Zircônia ${n}`) }
    ]
  },
  {
    area: "Dentística e Estética",
    categorias: [
      { nome: "Resinas Universais", itens: ["A1", "A2", "A3", "A3.5", "B1", "B2", "C2"].map(c => `Resina Filtek Z350 XT ${c} Body`) },
      { nome: "Resinas de Esmalte e Dentina", itens: ["EA1", "EA2", "DA1", "DA2", "WD", "WE"].map(c => `Resina Filtek Z350 XT ${c}`) },
      { nome: "Resinas Flow", itens: ["A1", "A2", "A3"].map(c => `Resina Flow Z350 XT ${c}`) },
      { nome: "Adesivos", itens: ["Single Bond Universal", "Ambar Universal", "Adper Single Bond 2", "Clearfil SE Bond"] },
      { nome: "Clareadores", itens: ["Whiteness Perfect 10%", "Whiteness Perfect 16%", "Whiteness Perfect 22%", "Whiteness HP AutoMix (Consultório)"] },
      { nome: "Matrizes e Cunhas", itens: ["Matriz Seccional Unimatrix", "Anel de Fixação", "Cunha de Madeira Sortida (C/ 100)", "Cunha Elástica"] }
    ]
  },
  {
    area: "Endodontia",
    categorias: [
      { nome: "Limas K-File 25mm", itens: ["06", "08", "10", "15", "20", "25", "30", "35", "40", "45", "50", "60", "70", "80"].map(s => `Lima K-File ${s} 25mm`) },
      { nome: "Limas K-File 31mm", itens: ["15", "20", "25", "30", "35", "40"].map(s => `Lima K-File ${s} 31mm`) },
      { nome: "Sistemas Rotatórios", itens: ["Protaper Gold SX-F3", "Wave One Gold Primary", "Reciproc Blue R25", "Reciproc Blue R40", "Hyflex CM Sortida"] },
      { nome: "Soluções Irrigadoras", itens: ["Hipoclorito de Sódio 1%", "Hipoclorito de Sódio 2.5%", "Hipoclorito de Sódio 5%", "EDTA 17% Líquido", "Clorexidina 2% Gel"] },
      { nome: "Cimentos Endodônticos", itens: ["AH Plus Jet", "Sealer Plus", "EndoFill", "MTA Angelus White", "Bio-C Sealer (Biocerâmico)"] }
    ]
  },
  {
    area: "Cirurgia e Periodontia",
    categorias: [
      { nome: "Fórceps", itens: ["1", "17", "18L", "18R", "16", "65", "69", "150", "151"].map(n => `Fórceps Adulto nº ${n}`) },
      { nome: "Alavancas", itens: ["Seladin Reta", "Seladin Curva", "Apical Reta", "Apical Esquerda", "Apical Direita", "Potts Esquerda", "Potts Direita"] },
      { nome: "Curetas de Periodontia", itens: ["Gracey 1-2", "Gracey 3-4", "Gracey 5-6", "Gracey 7-8", "Gracey 11-12", "Gracey 13-14", "McCall 13-14", "McCall 17-18"] },
      { nome: "Sutura", itens: ["Nylon 3-0 c/ Agulha", "Nylon 4-0 c/ Agulha", "Nylon 5-0 c/ Agulha", "Seda 3-0", "Vicryl 4-0 (Absorvível)"] }
    ]
  },
  {
    area: "Prótese e Reabilitação",
    categorias: [
      { nome: "Moldagem (Alginatos)", itens: ["Hydrogum 5", "Avagel", "Tropicalgin", "Jeltrate Dustless"] },
      { nome: "Moldagem (Silicones)", itens: ["Silicone de Adição Perfit (Kit)", "Silicone de Condensação Speedex", "Silicone de Condensação Zetaplus", "Ponta Misturadora Amarela"] },
      { nome: "Cimentos Resinosos", itens: ["RelyX U200", "Allcem Core", "Panavia V5", "Cimento de Zinco (Pó+Líq)"] },
      { nome: "Pinos e Retentores", itens: ["Pino de Fibra de Vidro nº 1", "Pino de Fibra de Vidro nº 2", "Pino de Fibra de Vidro nº 3", "Broca p/ Pino de Vidro"] }
    ]
  },
  {
    area: "Ortodontia",
    categorias: [
      { nome: "Brackets Metálicos", itens: ["Kit Morelli Roth .022", "Kit Orthometric MBT .022", "Kit Edgewise Standard"] },
      { nome: "Brackets Estéticos", itens: ["Kit Cerâmico Roth", "Kit Safira Orthometric", "Kit Policarbonato"] },
      { nome: "Fios Niti", itens: ["0.12", "0.14", "0.16", "0.18", "0.20"].map(f => `Arco NiTi ${f} (Sup/Inf)`) },
      { nome: "Elásticos", itens: ["Elástico Corrente Cinza", "Elástico Corrente Colorido", "Elástico Intraoral 1/8", "Elástico Intraoral 3/16", "Elástico Intraoral 5/16"] }
    ]
  },
  {
    area: "Biossegurança e Descartáveis",
    categorias: [
      { nome: "Luvas", itens: ["Látex P", "Látex M", "Látex G", "Nitrilo Azul P", "Nitrilo Azul M", "Nitrilo Preto M", "Estéril nº 7.0", "Estéril nº 8.0"] },
      { nome: "Máscaras e Toucas", itens: ["Máscara Tripla c/ Elástico", "Máscara N95/PFF2", "Touca Descartável Plissada", "Protetor Facial"] },
      { nome: "Papéis e Algodão", itens: ["Algodão Rolete (C/ 500)", "Gaze Estéril", "Gaze Não Estéril", "Bandeja de Papel", "Babador Descartável c/ Plástico"] },
      { nome: "Esterilização", itens: ["Detergente Enzimático 5L", "Álcool 70% 1L", "Papel Grau Cirúrgico 10cm", "Papel Grau Cirúrgico 20cm", "Fita p/ Autoclave"] }
    ]
  },
  {
    area: "Equipamentos e Periféricos",
    categorias: [
      { nome: "Peças de Mão", itens: ["Alta Rotação Sigma", "Contra Ângulo 1:1", "Micromotor Pneumático", "Peça Reta", "Kit Acadêmico (Alta+Baixa)"] },
      { nome: "Aparelhos", itens: ["Fotopolimerizador Valo Style", "Ultrassom Woodpecker", "Jato de Bicarbonato", "Localizador Apical Raypex", "Motor Endodôntico VDW"] },
      { nome: "Compressores e Bombas", itens: ["Compressor Isento de Óleo 40L", "Bomba de Vácuo 1HP"] }
    ]
  },
  {
    area: "Odontopediatria e Prevenção",
    categorias: [
      { nome: "Higiene Oral", itens: ["Escova Dental Curaprox 5460", "Fio Dental 50m", "Creme Dental Elmex", "Enxaguante Bucal s/ Álcool"] },
      { nome: "Prevenção", itens: ["Flúor Gel Morango", "Flúor Verniz", "Selante de Fóssulas e Fissuras", "Revelador de Placa Bacteriana"] },
      { nome: "Coroas e Matrizes", itens: ["Coroa de Aço (Sortidas)", "Matriz de Celuloide", "Resina de Cores (Rosa/Azul)"] }
    ]
  },
  {
    area: "HOF e Medicamentos",
    categorias: [
      { nome: "Harmonização", itens: ["Botox 100 UI", "Dysport 300 UI", "Preenchedor Restylane", "Ácido Hialurônico Rennova"] },
      { nome: "Agulhas e Seringas", itens: ["Agulha Gengival Curta", "Agulha Gengival Extra-Curta", "Seringa de Insulina 1ml", "Cânula p/ Preenchimento"] },
      { nome: "Medicamentos", itens: ["Dexametasona 4mg", "Amoxicilina 500mg", "Ibuprofeno 600mg", "Nimesulida 100mg"] }
    ]
  },
  {
    area: "Laboratório de Prótese",
    categorias: [
      { nome: "Gessos", itens: ["Gesso Comum Tipo II", "Gesso Pedra Tipo III", "Gesso Especial Tipo IV", "Gesso p/ Articulador"] },
      { nome: "Resinas Laboratoriais", itens: ["Resina Acrílica Termo", "Resina Acrílica Auto", "Líquido p/ Resina", "Isolante de Gesso"] },
      { nome: "Ceras e Outros", itens: ["Cera 7", "Cera Utilitária", "Disco de Carborundum", "Pó p/ Polimento"] }
    ]
  }
];

async function seedCatalogo() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('🧹 Limpando dados antigos...');
    await connection.query('DELETE FROM produtos');
    await connection.query('DELETE FROM categorias');
    await connection.query('DELETE FROM areas');
    
    console.log('🌱 Iniciando o SEED GIGANTE (Volume Industrial)...');

    let countAreas = 0;
    let countCats = 0;
    let countProds = 0;

    for (const rawArea of catalogoRaw) {
      const areaId = uuidv4();
      await connection.query('INSERT INTO areas (id, nome, ativo) VALUES (?, ?, 1)', [areaId, rawArea.area]);
      countAreas++;
      console.log(`✅ Área: ${rawArea.area}`);

      for (const rawCat of rawArea.categorias) {
        const categoriaId = uuidv4();
        await connection.query('INSERT INTO categorias (id, nome, area_id) VALUES (?, ?, ?)', [categoriaId, rawCat.nome, areaId]);
        countCats++;

        for (const nomeProduto of rawCat.itens) {
          const produtoId = uuidv4();
          await connection.query('INSERT INTO produtos (id, nome, categoria_id, ativo) VALUES (?, ?, ?, 1)', [produtoId, nomeProduto, categoriaId]);
          countProds++;
        }
        console.log(`   📂 Categoria: ${rawCat.nome} (${rawCat.itens.length} itens)`);
      }
    }

    console.log('\n' + '='.repeat(40));
    console.log(`✨ SEED CONCLUÍDO COM SUCESSO!`);
    console.log(`📍 Áreas: ${countAreas}`);
    console.log(`📂 Categorias: ${countCats}`);
    console.log(`📦 Produtos: ${countProds}`);
    console.log('='.repeat(40));

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

seedCatalogo();
