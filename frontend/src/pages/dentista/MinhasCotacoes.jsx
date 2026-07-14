import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../../contexts/CartContext';
import { AuthContext } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { Trash2, Send, ShoppingBag, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MinhasCotacoes() {
  const { showAlert } = useAlert();
  const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);

  const { user } = useContext(AuthContext);
  const [minhasCotacoes, setMinhasCotacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [observacoes, setObservacoes] = useState('');
  const navigate = useNavigate();

  async function loadCotacoes() {
    try {
      const res = await api.get('/cotacoes/minhas');
      setMinhasCotacoes(res.data);
    } catch (error) {
      console.error('Erro ao buscar cotações:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCotacoes();
  }, []);

  async function handleSubmitCotacao() {
    if (cart.length === 0) return;

    try {
      const itens = cart.map(item => ({
        produto_id: item.id,
        quantidade: item.quantidade
      }));

      await api.post('/cotacoes', {
        observacoes,
        itens
      });

      showAlert('Cotação enviada com sucesso para todos os fornecedores!', 'success');
      clearCart();
      setObservacoes('');
      loadCotacoes();
    } catch (error) {
      const msg = error.response?.status === 403 
        ? 'Apenas Dentistas podem enviar cotações. Sua conta atual é de Fornecedor.' 
        : (error.response?.data?.message || 'Erro ao processar cotação.');
      
      showAlert(msg, 'error');
    }
  }

  return (
    <>
      <Navbar />
      <main className="page-container">
        <h1 style={{ marginBottom: '2rem', color: 'var(--text-h)' }}>Painel do Dentista</h1>

        <div className="grid-2-1" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          {/* Lado Esquerdo: Carrinho e Histórico */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Bloco: Lista Atual (Carrinho) */}
            <section className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <ShoppingBag color="var(--primary)" />
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Lista de Itens para Cotar</h2>
              </div>

              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Sua lista está vazia. Adicione produtos do catálogo.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--accent-bg)', borderRadius: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <strong style={{ display: 'block', color: 'var(--text-h)' }}>{item.nome}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.marca}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input 
                          type="number" 
                          value={item.quantidade} 
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                          style={{ width: '50px', padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                        />
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}

                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Observações para os fornecedores:</label>
                    <textarea 
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Ex: Entrega urgente, parcelamento, etc."
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', minHeight: '80px', marginBottom: '1rem' }}
                    />
                    <button onClick={handleSubmitCotacao} className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
                      <Send size={18} /> Enviar Lista para Cotação
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Bloco: Histórico de Cotações */}
            <section className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Minhas Cotações Anteriores</h2>
              {loading ? <p>Carregando...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {minhasCotacoes.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>Nenhuma cotação enviada ainda.</p>
                  ) : (
                    minhasCotacoes.map(cota => (
                      <div key={cota.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.75rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <strong style={{ color: 'var(--text-h)' }}>Cotação #{cota.id.slice(0, 8)}</strong>
                            <span style={{ 
                              fontSize: '0.7rem', 
                              padding: '2px 8px', 
                              borderRadius: '10px', 
                              background: cota.status === 'aberta' ? '#e3f2fd' : '#e8f5e9',
                              color: cota.status === 'aberta' ? '#1976d2' : '#2e7d32',
                              fontWeight: '700'
                            }}>
                              {cota.status.toUpperCase()}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(cota.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button 
                          onClick={() => navigate(`/cotacao/${cota.id}/respostas`)}
                          className="btn-secondary" 
                          style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                        >
                          Ver Respostas
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Lado Direito: Dicas e Info */}
          <aside>
            <div className="card" style={{ padding: '1.5rem', background: 'var(--primary)', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <CheckCircle2 size={24} />
                <h3 style={{ margin: 0 }}>Como funciona?</h3>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.5', opacity: 0.9 }}>
                1. Adicione os produtos do catálogo à sua lista.<br/>
                2. Envie a cotação para todos os fornecedores da plataforma.<br/>
                3. Eles responderão com os melhores preços e disponibilidade.<br/>
                4. Você escolhe o melhor custo-benefício e finaliza a compra!
              </p>
            </div>
          </aside>

        </div>
      </main>
    </>
  );
}
