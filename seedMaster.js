require('dotenv').config();
const { pool } = require('./src/config/database');
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

async function seedFinal() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('🧹 Limpando para CARGA MÁXIMA...');
    await connection.query('DELETE FROM produtos');
    await connection.query('DELETE FROM categorias');
    await connection.query('DELETE FROM areas');

    let total = 0;
    for (const a of areas) {
      const areaId = uuidv4();
      await connection.query('INSERT INTO areas (id, nome, ativo) VALUES (?, ?, 1)', [areaId, a.nome]);
      
      for (const catNome of a.categorias) {
        const catId = uuidv4();
        await connection.query('INSERT INTO categorias (id, nome, area_id) VALUES (?, ?, ?)', [catId, catNome, areaId]);
        
        // Para cada categoria, criar de 3 a 5 marcas aleatórias
        const numMarcas = Math.floor(Math.random() * 3) + 3; // 3 a 5
        const marcasEmbaralhadas = [...marcasMaster].sort(() => 0.5 - Math.random());
        const marcasEscolhidas = marcasEmbaralhadas.slice(0, numMarcas);

        for (const m of marcasEscolhidas) {
          const prodId = uuidv4();
          const nomeFinal = `${catNome} - ${m}`;
          await connection.query(
            'INSERT INTO produtos (id, nome, marca, descricao, categoria_id, ativo, imagem_url) VALUES (?, ?, ?, ?, ?, 1, ?)',
            [prodId, nomeFinal, m, `Alta qualidade garantida pela ${m}. Ideal para sua clínica.`, catId, `https://placehold.co/400x400?text=${encodeURIComponent(nomeFinal)}`]
          );
          total++;
        }
      }
      console.log(`✅ Área ${a.nome} populada.`);
    }

    console.log(`\n🚀 CARGA MÁXIMA CONCLUÍDA! Total de ${total} produtos criados.`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

seedFinal();
