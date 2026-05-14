import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { ArrowLeft, Award, CheckCircle2, AlertCircle, ShoppingCart, Tag } from 'lucide-react';

export default function VisualizarRespostas() {
  const { id } = useParams(); // ID da Cotação
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
        <button onClick={() => navigate('/minhas-cotacoes')} className="btn-secondary" style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Voltar para Minhas Cotações
        </button>

        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--text-h)', margin: '0 0 0.5rem' }}>Resultados da Cotação #{cotacao.id.slice(0, 8)}</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Criada em {new Date(cotacao.created_at).toLocaleDateString()} • {cotacao.itens.length} itens solicitados
          </p>
        </div>

        {respostas.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
            <AlertCircle size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>Aguardando respostas...</h3>
            <p style={{ color: 'var(--text-muted)' }}>Os fornecedores ainda estão analisando seu pedido. Você será notificado assim que receber a primeira oferta.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Cards de Resumo dos Fornecedores */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {respostas.map((res, index) => (
                <div key={res.id} className="card" style={{ 
                  border: index === 0 ? '2px solid var(--primary)' : '1px solid var(--border)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {index === 0 && (
                    <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--primary)', color: 'white', padding: '0.25rem 1rem', fontSize: '0.75rem', fontWeight: 'bold', borderBottomLeftRadius: '0.75rem' }}>
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
                    {res.itens.filter(i => i.tem_produto).length} de {cotacao.itens.length} itens disponíveis
                  </div>

                  <button className="btn-primary" style={{ width: '100%' }}>
                    Aceitar e Comprar
                  </button>
                </div>
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
                                  {itemResp.observacao_item && <div style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>{itemResp.observacao_item}</div>}
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
