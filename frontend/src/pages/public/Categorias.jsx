import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import { ArrowLeft, Box } from 'lucide-react';

export default function Categorias() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [areaNome, setAreaNome] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Busca o nome da área para o cabeçalho
        const areaRes = await api.get(`/areas/${id}`);
        if (areaRes.data) {
          setAreaNome(areaRes.data.nome);
        }

        // Busca as categorias dessa área específica
        const catRes = await api.get(`/categorias?area_id=${id}`);
        setCategorias(catRes.data);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  return (
    <>
      <Navbar />
      <main className="page-container">
        <button 
          onClick={() => navigate('/')} 
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: '500' }}
        >
          <ArrowLeft size={20} /> Voltar para Áreas
        </button>

        <div className="page-header">
          <h1>Categorias: {areaNome || 'Carregando...'}</h1>
          <p>Selecione uma categoria para ver os produtos disponíveis.</p>
        </div>

        {loading ? (
          <p>Carregando categorias...</p>
        ) : (
          <div className="grid">
            {categorias.length === 0 ? (
              <p>Nenhuma categoria cadastrada para esta área no momento.</p>
            ) : (
              categorias.map(cat => (
                <div key={cat.id} className="card">
                  <div style={{ color: 'var(--secondary)' }}>
                    <Box size={32} />
                  </div>
                  <div>
                    <h3 className="card-title">{cat.nome}</h3>
                  </div>
                  <button className="btn-primary" style={{ marginTop: 'auto' }}>
                    Ver Produtos
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
