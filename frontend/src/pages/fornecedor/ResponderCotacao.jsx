import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { Check, X, Send, ArrowLeft, Lock } from 'lucide-react';

export default function ResponderCotacao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cotacao, setCotacao] = useState(null);
  const [itens, setItens] = useState([]);
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(true);
  const [cotacaoFechada, setCotacaoFechada] = useState(false);

  async function loadData() {
    try {
      const res = await api.get(`/cotacoes/${id}`);
      setCotacao(res.data);

      if (res.data.status === 'finalizada') {
        setCotacaoFechada(true);
        return;
      }

      const itensIniciais = res.data.itens.map(item => ({
        produto_id: item.produto_id,
        produto_nome: item.produto_nome,
        produto_marca: item.produto_marca,
        quantidade: item.quantidade,
        tem_produto: true,
        preco_unitario: '',
        observacao_item: ''
      }));
      setItens(itensIniciais);
    } catch (error) {
      console.error('Erro ao buscar detalhes da cotação:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  function handleUpdateItem(index, field, value) {
    const newItens = [...itens];
    newItens[index][field] = value;
    setItens(newItens);
  }

  async function handleSubmit() {
    try {
      // Validação: se tem o produto, precisa do preço
      const invalid = itens.find(i => i.tem_produto && (!i.preco_unitario || i.preco_unitario <= 0));
      if (invalid) {
        alert(`Por favor, informe o preço para o item: ${invalid.produto_nome}`);
        return;
      }

      await api.post('/respostas', {
        cotacao_id: id,
        observacoes,
        itens
      });

      alert('Resposta enviada com sucesso!');
      navigate('/fornecedor');
    } catch (error) {
      alert('Erro ao enviar resposta.');
    }
  }

  const valorTotal = itens.reduce((acc, i) => {
    if (i.tem_produto && i.preco_unitario) {
      return acc + (parseFloat(i.preco_unitario) * i.quantidade);
    }
    return acc;
  }, 0);

  if (loading) return <p>Carregando...</p>;

  if (cotacaoFechada) {
    return (
      <>
        <Navbar />
        <main className="page-container">
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '60vh'
          }}>
            <div className="card" style={{
              textAlign: 'center', padding: '3rem',
              maxWidth: '480px', width: '100%'
            }}>
              <div style={{
                width: '80px', height: '80px',
                background: '#fff5f5',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'var(--danger, #e53935)'
              }}>
                <Lock size={36} />
              </div>
              <h2 style={{ margin: '0 0 0.75rem', color: 'var(--text-h)' }}>
                Cotação Encerrada
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '0.5rem' }}>
                Esta cotação foi encerrada pelo dentista.
              </p>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
                Ela não está mais disponível para novas respostas.
              </p>
              <button
                onClick={() => navigate('/fornecedor')}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} />
                Voltar ao Painel
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="page-container">
        <button onClick={() => navigate('/fornecedor')} className="btn-secondary" style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Voltar
        </button>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ margin: 0 }}>Responder Cotação #{cotacao.id.slice(0, 8)}</h1>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Dentista</span>
              <strong style={{ fontSize: '1.1rem' }}>{cotacao.dentista_nome}</strong>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Disponibilidade</th>
                  <th style={{ padding: '1rem' }}>Produto / Marca</th>
                  <th style={{ padding: '1rem' }}>Qtd</th>
                  <th style={{ padding: '1rem' }}>Preço Unitário (R$)</th>
                  <th style={{ padding: '1rem' }}>Subtotal</th>
                  <th style={{ padding: '1rem' }}>Observação</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border)', background: item.tem_produto ? 'transparent' : '#fafafa', opacity: item.tem_produto ? 1 : 0.6 }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleUpdateItem(index, 'tem_produto', true)}
                          style={{ 
                            padding: '0.5rem', 
                            borderRadius: '0.5rem', 
                            border: '1px solid ' + (item.tem_produto ? 'var(--primary)' : 'var(--border)'),
                            background: item.tem_produto ? 'var(--accent-bg)' : 'white',
                            color: item.tem_produto ? 'var(--primary)' : 'var(--text-muted)',
                            cursor: 'pointer'
                          }}
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => handleUpdateItem(index, 'tem_produto', false)}
                          style={{ 
                            padding: '0.5rem', 
                            borderRadius: '0.5rem', 
                            border: '1px solid ' + (!item.tem_produto ? 'var(--danger)' : 'var(--border)'),
                            background: !item.tem_produto ? '#fff5f5' : 'white',
                            color: !item.tem_produto ? 'var(--danger)' : 'var(--text-muted)',
                            cursor: 'pointer'
                          }}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <strong>{item.produto_nome}</strong>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.produto_marca}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>{item.quantidade}</td>
                    <td style={{ padding: '1rem' }}>
                      <input 
                        type="number" 
                        disabled={!item.tem_produto}
                        value={item.preco_unitario}
                        onChange={(e) => handleUpdateItem(index, 'preco_unitario', e.target.value)}
                        placeholder="0,00"
                        style={{ width: '100px', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                      />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {item.tem_produto && item.preco_unitario ? (
                        <strong>R$ {(parseFloat(item.preco_unitario) * item.quantidade).toFixed(2)}</strong>
                      ) : '--'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <input 
                        type="text" 
                        disabled={!item.tem_produto}
                        value={item.observacao_item}
                        onChange={(e) => handleUpdateItem(index, 'observacao_item', e.target.value)}
                        placeholder="Ex: Validade curta..."
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <div className="card" style={{ background: 'var(--accent-bg)', padding: '1.5rem', minWidth: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Valor Total da Resposta:</span>
                <strong style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>R$ {valorTotal.toFixed(2)}</strong>
              </div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Observações gerais:</label>
              <textarea 
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', minHeight: '80px', marginBottom: '1rem' }}
                placeholder="Condições de pagamento, frete, etc."
              />
              <button onClick={handleSubmit} className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
                <Send size={18} /> Enviar Resposta de Cotação
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
