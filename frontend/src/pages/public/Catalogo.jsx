import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import { Layers } from 'lucide-react';

export default function Catalogo() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadAreas() {
      try {
        const response = await api.get('/areas');
        setAreas(response.data);
      } catch (error) {
        console.error('Erro ao buscar áreas:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAreas();
  }, []);

  return (
    <>
      <Navbar />
      <main className="page-container">
        <div className="page-header">
          <h1>Catálogo de Produtos</h1>
          <p>Navegue pelas nossas áreas de especialidade odontológica.</p>
        </div>

        {loading ? (
          <p>Carregando áreas...</p>
        ) : (
          <div className="grid">
            {areas.length === 0 ? (
              <p>Nenhuma área cadastrada no momento.</p>
            ) : (
              areas.map(area => (
                <div key={area.id} className="card">
                  <div style={{ color: 'var(--primary)' }}>
                    <Layers size={32} />
                  </div>
                  <div>
                    <h3 className="card-title">{area.nome}</h3>
                    <p className="card-desc">{area.descricao || 'Sem descrição.'}</p>
                  </div>
                  <button 
                    className="btn-primary" 
                    style={{ marginTop: 'auto' }}
                    onClick={() => navigate(`/area/${area.id}/categorias`)}
                  >
                    Ver Categorias
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </>
  );
}
