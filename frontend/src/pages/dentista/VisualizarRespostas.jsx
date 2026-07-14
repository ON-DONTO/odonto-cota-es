import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { ArrowLeft, CheckCircle2, AlertCircle, Tag, XCircle } from 'lucide-react';

export default function VisualizarRespostas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cotacao, setCotacao] = useState(null);
  const [respostas, setRespostas] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [cotRes, resRes] = await Promise.all([
        api.get(`/cotacoes/${id}`),
        api.get(`/respostas/cotacao/${id}`)
      ]);
      setCotacao(cotRes.data);
      setRespostas(resRes.data);
    } catch (error) {
      console.error('Erro ao buscar respostas:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) return <p>Carregando resultados...</p>;

  return (
    <>
      <Navbar />
      <main className="page-container">
        <button
          onClick={() => navigate('/minhas-cotacoes')}
          className="btn-secondary"
          style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={18} /> Voltar para Minhas Cotações
        </button>

        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--text-h)', margin: '0 0 0.5rem' }}>
            Resultados da Cotação #{cotacao.id.slice(0, 8)}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Criada em {new Date(cotacao.created_at).toLocaleDateString()} • {cotacao.itens.length} itens solicitados
          </p>
        </div>

        {respostas.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
            <AlertCircle size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>Aguardando respostas...</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Os fornecedores ainda estão analisando seu pedido. Você será notificado assim que receber a primeira oferta.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Cards de Resumo dos Fornecedores */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {respostas.map((res, index) => (
                <CardFornecedor
                  key={res.id}
                  res={res}
                  index={index}
                  totalItens={cotacao.itens.length}
                  cotacaoId={cotacao.id}
                />
              ))}
            </div>

            {/* Tabela Detalhada Comparativa */}
            <section className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Comparação por Item</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '1rem' }}>Produto Solicitado</th>
                      {respostas.map(res => (
                        <th key={res.id} style={{ padding: '1rem', textAlign: 'center' }}>{res.fornecedor_nome}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cotacao.itens.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem' }}>
                          <strong>{item.produto_nome}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.produto_marca}</span>
                        </td>
                        {respostas.map(res => {
                          const itemResp = res.itens.find(ri => ri.produto_id === item.produto_id);
                          return (
                            <td key={res.id} style={{ padding: '1rem', textAlign: 'center' }}>
                              {itemResp?.tem_produto ? (
                                <div>
                                  <div style={{ fontWeight: '600' }}>R$ {Number(itemResp.preco_unitario).toFixed(2)}</div>
                                  {itemResp.observacao_item && (
                                    <div style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>{itemResp.observacao_item}</div>
                                  )}
                                </div>
                              ) : (
                                <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>Não possui</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        )}
      </main>
    </>
  );
}

// ── Card do Fornecedor com Modal ──────────────────────────────
function CardFornecedor({ res, index, totalItens, cotacaoId }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  async function handleAceitar() {
    setCarregando(true);
    setErro(null);
    try {
      await api.patch(`/cotacoes/${cotacaoId}/fechar`);
      setSucesso(true);
    } catch (err) {
      setErro(err?.response?.data?.message || 'Não foi possível fechar a cotação. Tente novamente.');
    } finally {
      setCarregando(false);
      setModalAberto(true);
    }
  }

  function handleFecharModal() {
    setModalAberto(false);
    setSucesso(false);
    setErro(null);
  }

  return (
    <>
      <div className="card" style={{
        border: index === 0 ? '2px solid var(--primary)' : '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {index === 0 && (
          <div style={{
            position: 'absolute', top: 0, right: 0,
            background: 'var(--primary)', color: 'white',
            padding: '0.25rem 1rem', fontSize: '0.75rem', fontWeight: 'bold',
            borderBottomLeftRadius: '0.75rem'
          }}>
            MELHOR PREÇO
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ background: 'var(--accent-bg)', padding: '0.5rem', borderRadius: '50%', color: 'var(--primary)' }}>
            <Tag size={20} />
          </div>
          <strong style={{ fontSize: '1.1rem' }}>{res.fornecedor_nome}</strong>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Valor Total:</span>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>
            R$ {Number(res.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          {res.itens.filter(i => i.tem_produto).length} de {totalItens} itens disponíveis
        </div>

        <button
          id={`btn-aceitar-${res.id}`}
          className="btn-primary"
          style={{ width: '100%', opacity: carregando ? 0.7 : 1 }}
          onClick={handleAceitar}
          disabled={carregando}
        >
          {carregando ? 'Processando...' : 'Aceitar e Comprar'}
        </button>
      </div>

      {/* Modal */}
      {modalAberto && (
        <div
          id={`modal-aceitar-${res.id}`}
          onClick={(e) => { if (e.target === e.currentTarget) handleFecharModal(); }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div style={{
            background: 'var(--card-bg, #fff)',
            borderRadius: '1.25rem',
            padding: '2.5rem',
            maxWidth: '460px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            animation: 'slideUp 0.25s ease',
            textAlign: 'center'
          }}>

            {sucesso ? (
              <>
                {/* Sucesso */}
                <div style={{
                  width: '72px', height: '72px',
                  background: 'var(--accent-bg, #e8f5e9)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  color: 'var(--primary)'
                }}>
                  <CheckCircle2 size={36} />
                </div>
                <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.4rem', color: 'var(--text-h, #1a1a1a)' }}>
                  Ótima escolha!
                </h2>
                <p style={{ color: 'var(--text-muted, #666)', margin: '0 0 0.5rem', lineHeight: '1.6' }}>
                  Você selecionou a proposta de <strong style={{ color: 'var(--text-h, #1a1a1a)' }}>{res.fornecedor_nome}</strong>.
                </p>
                <p style={{ color: 'var(--text-muted, #666)', margin: '0 0 2rem', lineHeight: '1.6' }}>
                  📧 O fornecedor irá <strong>entrar em contato com você via e-mail</strong> em breve para finalizar o pedido e combinar os detalhes da entrega.
                </p>
                <div style={{
                  background: 'var(--accent-bg, #f0f9f0)',
                  border: '1px solid var(--border, #e0e0e0)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '2rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted, #666)'
                }}>
                  💡 Fique atento à sua caixa de entrada e à pasta de spam.
                </div>
              </>
            ) : (
              <>
                {/* Erro */}
                <div style={{
                  width: '72px', height: '72px',
                  background: '#fff5f5',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  color: 'var(--danger, #e53935)'
                }}>
                  <XCircle size={36} />
                </div>
                <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.4rem', color: 'var(--text-h, #1a1a1a)' }}>
                  Algo deu errado
                </h2>
                <p style={{ color: 'var(--text-muted, #666)', margin: '0 0 2rem', lineHeight: '1.6' }}>
                  {erro}
                </p>
              </>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleFecharModal}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Fechar
              </button>
              {sucesso && (
                <button
                  onClick={handleFecharModal}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  Entendido ✓
                </button>
              )}
            </div>
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(30px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
