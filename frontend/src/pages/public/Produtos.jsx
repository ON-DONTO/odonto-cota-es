import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import ProductModal from '../../components/ProductModal';
import { AuthContext } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext';
import { ArrowLeft, Box, Plus, Trash2, Notebook, Info, CheckCircle } from 'lucide-react';
import { useAlert } from '../../contexts/AlertContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function makeSvgPlaceholder(nome) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="#f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#0f766e">${nome}</text></svg>`;
  return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svg)))}`;
}

function getProductImage(prod) {
  if (!prod.imagem_url) return null;
  // Caminho local (/uploads/...) → monta URL absoluta do backend
  if (prod.imagem_url.startsWith('/uploads/')) {
    return `${API_BASE}${prod.imagem_url}`;
  }
  // URL externa (http/https)
  return prod.imagem_url;
}

export default function Produtos() {
  const { showAlert } = useAlert();
  const { id } = useParams(); // ID da Categoria

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [produtos, setProdutos] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart, cart } = useContext(CartContext);

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
      showAlert('Erro ao adicionar produto. Verifique os dados.', 'error');
      throw error;
    }
  }

  async function handleDeleteProduct(prodId, nome) {
    showAlert({
      message: `Deseja realmente excluir o produto "${nome}"?`,
      type: 'question',
      title: 'Confirmar Exclusão',
      isConfirm: true,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await api.delete(`/produtos/${prodId}`);
          loadData();
        } catch (error) {
          showAlert('Erro ao excluir produto.', 'error');
        }
      }
    });
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
                <Notebook size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>Nenhum produto cadastrado nesta categoria.</p>
              </div>
            ) : (
              produtos.map(prod => (
                <div key={prod.id} className="card" style={{ alignItems: 'flex-start', textAlign: 'left', position: 'relative' }}>
                  {user?.tipo === 'admin' && (
                    <button 
                      onClick={() => handleDeleteProduct(prod.id, prod.nome)}
                      style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', zIndex: 10 }}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  
                  {getProductImage(prod) ? (
                    <div style={{ 
                      width: '100%', 
                      height: '160px', 
                      borderRadius: '0.75rem', 
                      overflow: 'hidden', 
                      marginBottom: '1rem', 
                      background: '#f8fafc', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '1px solid var(--border)'
                    }}>
                      <img 
                        src={getProductImage(prod)} 
                        alt={prod.nome} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'contain',
                          padding: '0.5rem',
                          transition: 'transform 0.3s ease'
                        }} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = makeSvgPlaceholder(prod.nome);
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ 
                      width: '100%',
                      height: '160px',
                      borderRadius: '0.75rem',
                      marginBottom: '1rem',
                      background: 'var(--accent-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border)'
                    }}>
                      <img
                        src={makeSvgPlaceholder(prod.nome)}
                        alt={prod.nome}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.5rem' }}
                      />
                    </div>

                  )}
                  <div style={{ width: '100%' }}>
                    <h3 className="card-title" style={{ margin: '0.5rem 0' }}>{prod.nome}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      {prod.descricao || 'Nenhuma descrição disponível.'}
                    </p>
                  </div>
                  
                  <div style={{ marginTop: 'auto', width: '100%', display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className={cart.some(i => i.id === prod.id) ? "btn-secondary" : "btn-primary"}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      onClick={() => addToCart(prod)}
                    >
                      {cart.some(i => i.id === prod.id) ? (
                        <><CheckCircle size={18} /> Adicionado</>
                      ) : (
                        "Solicitar Cotação"
                      )}
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
