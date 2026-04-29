import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import CategoryModal from '../../components/CategoryModal';
import { AuthContext } from '../../contexts/AuthContext';
import { ArrowLeft, Box, Plus, Trash2, ShoppingBag } from 'lucide-react';

export default function Categorias() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [categorias, setCategorias] = useState([]);
  const [areaNome, setAreaNome] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadData() {
    try {
      const areaRes = await api.get(`/areas/${id}`);
      if (areaRes.data) {
        setAreaNome(areaRes.data.nome);
      }

      const catRes = await api.get(`/categorias?area_id=${id}`);
      setCategorias(catRes.data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function handleAddCategory(nome) {
    try {
      await api.post('/categorias', { nome, area_id: id });
      loadData();
    } catch (error) {
      alert('Erro ao criar categoria. Verifique se o nome já existe.');
      throw error;
    }
  }

  async function handleDeleteCategory(catId, nome) {
    if (!window.confirm(`Deseja excluir a categoria "${nome}"? Isso falhará se houver produtos dentro dela.`)) {
      return;
    }

    try {
      await api.delete(`/categorias/${catId}`);
      loadData();
    } catch (error) {
      alert('Erro ao excluir categoria. Certifique-se de que ela não possui produtos vinculados.');
    }
  }

  return (
    <>
      <Navbar />
      <main className="page-container">
        <button 
          onClick={() => navigate('/')} 
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontWeight: '600' }}
        >
          <ArrowLeft size={20} /> Voltar para Áreas
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--text-h)', margin: '0 0 0.5rem' }}>{areaNome || 'Carregando...'}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Explore as categorias de produtos desta especialidade.</p>
          </div>

          {user?.tipo === 'admin' && (
            <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ padding: '0.8rem 1.5rem' }}>
              <Plus size={20} /> Adicionar Categoria
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Carregando categorias...</p>
          </div>
        ) : (
          <div className="grid">
            {categorias.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '1rem', border: '1px dashed var(--border)' }}>
                <Box size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>Nenhuma categoria cadastrada para esta área no momento.</p>
              </div>
            ) : (
              categorias.map(cat => (
                <div key={cat.id} className="card" style={{ alignItems: 'flex-start', textAlign: 'left', position: 'relative' }}>
                  {user?.tipo === 'admin' && (
                    <button 
                      onClick={() => handleDeleteCategory(cat.id, cat.nome)}
                      style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  
                  <div style={{ background: 'var(--accent-bg)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--secondary)' }}>
                    <Box size={24} />
                  </div>
                  <h3 className="card-title" style={{ margin: '0.5rem 0' }}>{cat.nome}</h3>
                  <button 
                    className="btn-primary" 
                    style={{ marginTop: 'auto', width: '100%', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                    onClick={() => navigate(`/categoria/${cat.id}/produtos`)}
                  >
                    <ShoppingBag size={18} /> Ver Produtos
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <CategoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddCategory}
        areaNome={areaNome}
      />
    </>
  );
}
