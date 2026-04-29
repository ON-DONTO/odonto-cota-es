import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import ProductModal from '../../components/ProductModal';
import { AuthContext } from '../../contexts/AuthContext';
import { ArrowLeft, Box, Plus, Trash2, ShoppingBag, Info } from 'lucide-react';

export default function Produtos() {
  const { id } = useParams(); // ID da Categoria
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [produtos, setProdutos] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadData() {
    try {
      // Busca dados da categoria (nome e área)
      const catRes = await api.get(`/categorias/${id}`);
      setCategoria(catRes.data);

      // Busca os produtos desta categoria
      const prodRes = await api.get(`/produtos?categoria_id=${id}`);
      setProdutos(prodRes.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function handleAddProduct(data) {
    try {
      await api.post('/produtos', { ...data, categoria_id: id });
      loadData();
    } catch (error) {
      alert('Erro ao adicionar produto. Verifique os dados.');
      throw error;
    }
  }

  async function handleDeleteProduct(prodId, nome) {
    if (!window.confirm(`Deseja excluir o produto "${nome}"?`)) {
      return;
    }

    try {
      await api.delete(`/produtos/${prodId}`);
      loadData();
    } catch (error) {
      alert('Erro ao excluir produto.');
    }
  }

  return (
    <>
      <Navbar />
      <main className="page-container">
        <button 
          onClick={() => navigate(`/area/${categoria?.area_id}/categorias`)} 
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontWeight: '600' }}
        >
          <ArrowLeft size={20} /> Voltar para Categorias
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--text-h)', margin: '0 0 0.5rem' }}>
              {categoria?.nome || 'Carregando...'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
              Área: <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{categoria?.area_nome}</span>
            </p>
          </div>

          {user?.tipo === 'admin' && (
            <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ padding: '0.8rem 1.5rem' }}>
              <Plus size={20} /> Adicionar Produto
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Carregando produtos...</p>
          </div>
        ) : (
          <div className="grid">
            {produtos.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '1rem', border: '1px dashed var(--border)' }}>
                <ShoppingBag size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>Nenhum produto cadastrado nesta categoria.</p>
              </div>
            ) : (
              produtos.map(prod => (
                <div key={prod.id} className="card" style={{ alignItems: 'flex-start', textAlign: 'left', position: 'relative' }}>
                  {user?.tipo === 'admin' && (
                    <button 
                      onClick={() => handleDeleteProduct(prod.id, prod.nome)}
                      style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  
                  <div style={{ background: 'var(--accent-bg)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--primary)' }}>
                    <ShoppingBag size={24} />
                  </div>
                  <div style={{ width: '100%' }}>
                    <h3 className="card-title" style={{ margin: '0.5rem 0' }}>{prod.nome}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      {prod.descricao || 'Nenhuma descrição disponível.'}
                    </p>
                  </div>
                  
                  <div style={{ marginTop: 'auto', width: '100%', display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-primary" style={{ flex: 1 }}>
                      Solicitar Cotação
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddProduct}
        categoriaNome={categoria?.nome}
      />
    </>
  );
}
