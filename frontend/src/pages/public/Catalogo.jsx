import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import AreaModal from '../../components/AreaModal';
import { AuthContext } from '../../contexts/AuthContext';
import { Layers, ArrowRight, ShoppingBag, ShieldCheck, Zap, Plus, Trash2 } from 'lucide-react';

export default function Catalogo() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  async function loadAreas() {
    setLoading(true);
    try {
      const response = await api.get('/areas');
      setAreas(response.data);
    } catch (error) {
      console.error('Erro ao buscar áreas:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAreas();
  }, []);

  async function handleAddArea(data) {
    try {
      await api.post('/areas', data);
      loadAreas();
    } catch (error) {
      alert('Erro ao criar área. Verifique se o nome já existe.');
    }
  }

  async function handleDeleteArea(id, nome) {
    if (!window.confirm(`Tem certeza que deseja excluir a área "${nome}"? Isso falhará se houver categorias dentro dela.`)) {
      return;
    }

    try {
      await api.delete(`/areas/${id}`);
      loadAreas();
    } catch (error) {
      alert('Erro ao excluir área. Certifique-se de que ela está vazia (sem categorias).');
    }
  }

  return (
    <>
      <Navbar />
      <header style={{ 
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
        color: 'white',
        padding: '5rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="page-container" style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ color: 'white', fontSize: '3.5rem', marginBottom: '1.5rem' }}>O Melhor em Produtos Odontológicos</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
            A plataforma B2B definitiva para clínicas e fornecedores no Espírito Santo. 
            Cotações rápidas, estoque atualizado e os melhores preços em um só lugar.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <ShieldCheck size={20} /> <span>100% Seguro</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <Zap size={20} /> <span>Entrega Rápida</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <ShoppingBag size={20} /> <span>Melhores Marcas</span>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
      </header>

      <main className="page-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border)', paddingBottom: '1rem', marginBottom: '3rem' }}>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-h)' }}>Navegue por Áreas</h2>
            <p>Selecione a especialidade desejada para explorar as categorias de produtos.</p>
          </div>
          {user?.tipo === 'admin' && (
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} /> Nova Área
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Carregando áreas do catálogo...</p>
          </div>
        ) : (
          <div className="grid">
            {areas.length === 0 ? (
              <p>Nenhuma área cadastrada no momento.</p>
            ) : (
              areas.map(area => (
                <div key={area.id} className="card" style={{ position: 'relative' }}>
                  {user?.tipo === 'admin' && (
                    <button 
                      onClick={() => handleDeleteArea(area.id, area.nome)}
                      style={{ 
                        position: 'absolute', 
                        top: '1rem', 
                        right: '1rem', 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--danger)', 
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        transition: 'background 0.2s'
                      }}
                      title="Excluir Área"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  
                  <div style={{ 
                    background: 'var(--accent-bg)', 
                    padding: '1.5rem', 
                    borderRadius: '1rem', 
                    color: 'var(--primary)' 
                  }}>
                    <Layers size={40} />
                  </div>
                  <h3 className="card-title">{area.nome}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {area.descricao || `Explore todos os produtos e categorias disponíveis em ${area.nome}.`}
                  </p>
                  <button 
                    className="btn-primary" 
                    style={{ marginTop: 'auto', width: '100%' }}
                    onClick={() => navigate(`/area/${area.id}/categorias`)}
                  >
                    Explorar Área <ArrowRight size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <footer style={{ marginTop: 'auto', padding: '3rem 2rem', background: 'white', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          &copy; 2024 Odonto Cota ES. Todos os direitos reservados.
        </p>
      </footer>

      <AreaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddArea} 
      />
    </>
  );
}
