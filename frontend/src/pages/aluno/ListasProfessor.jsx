import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext';
import { BookOpen, Key, CheckCircle, ChevronDown, ChevronUp, AlertCircle, ShoppingBag, ArrowRight, User } from 'lucide-react';

export default function ListasProfessor() {
  const { user, updateUser } = useContext(AuthContext);
  const { importListToCart } = useContext(CartContext);
  
  const [codigoInput, setCodigoInput] = useState('');
  const [teacher, setTeacher] = useState(null);
  const [listas, setListas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState('');
  const [expandedListId, setExpandedListId] = useState(null);
  const [listDetails, setListDetails] = useState({}); // { [listId]: details }
  
  const navigate = useNavigate();

  async function loadListas() {
    if (!user?.professor_id) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/listas');
      setTeacher(res.data.teacher);
      setListas(res.data.lists);
    } catch (err) {
      console.error('Erro ao buscar listas acadêmicas:', err);
      setError('Não foi possível carregar as listas de materiais.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListas();
  }, [user?.professor_id]);

  async function handleLink(e) {
    e.preventDefault();
    if (!codigoInput.trim()) return;

    setError('');
    setLinking(true);

    try {
      const res = await api.post('/listas/vincular', { codigo: codigoInput });
      updateUser({ professor_id: res.data.professor_id });
      setCodigoInput('');
      alert('Professor vinculado com sucesso!');
    } catch (err) {
      console.error('Erro ao vincular professor:', err);
      setError(err.response?.data?.error || 'Código inválido ou erro de conexão.');
    } finally {
      setLinking(false);
    }
  }

  async function toggleExpand(listId) {
    if (expandedListId === listId) {
      setExpandedListId(null);
      return;
    }

    setExpandedListId(listId);

    // Se já tiver carregado os detalhes, não chama a API novamente
    if (listDetails[listId]) return;

    try {
      const res = await api.get(`/listas/${listId}`);
      setListDetails(prev => ({
        ...prev,
        [listId]: res.data
      }));
    } catch (err) {
      console.error('Erro ao carregar itens da lista:', err);
      alert('Não foi possível carregar os itens desta lista.');
    }
  }

  function handleImportList(listaId) {
    const details = listDetails[listaId];
    if (!details || !details.itens || details.itens.length === 0) {
      alert('Carregando itens da lista... Por favor, aguarde.');
      return;
    }

    const cartProducts = details.itens.map(item => ({
      id: item.produto_id,
      nome: item.produto_nome,
      marca: item.produto_marca || 'Sem Marca',
      quantidade: item.quantidade
    }));

    importListToCart(cartProducts);
    alert('Produtos adicionados à sua lista de cotação com sucesso!');
    navigate('/minhas-cotacoes');
  }

  return (
    <>
      <Navbar />
      <main className="page-container">
        
        {/* Se o aluno ainda não estiver vinculado a um professor */}
        {!user?.professor_id ? (
          <div style={{ maxWidth: '600px', margin: '3rem auto 0' }}>
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ background: 'var(--accent-bg)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justify: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
                <Key size={32} />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-h)' }}>Vincular ao seu Professor</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.5' }}>
                Digite o código de acesso compartilhado pelo seu professor (ex: <code>PROF-XXXXXX</code>) para visualizar e cotar a lista de materiais exigidos para as aulas.
              </p>

              {error && (
                <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLink} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  value={codigoInput}
                  onChange={(e) => setCodigoInput(e.target.value)}
                  placeholder="Código do Professor"
                  style={{ flex: 1, minWidth: '200px', padding: '1rem', textTransform: 'uppercase' }}
                  required
                />
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ padding: '1rem 2rem' }}
                  disabled={linking}
                >
                  {linking ? 'Vinculando...' : 'Vincular'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Se o aluno já estiver vinculado */
          <div>
            {/* Cabeçalho do Vínculo */}
            <div className="card" style={{ 
              background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', 
              color: 'white', 
              padding: '2rem', 
              borderRadius: '1rem',
              marginBottom: '2.5rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%' }}>
                  <User size={32} />
                </div>
                <div>
                  <h1 style={{ margin: '0 0 0.25rem 0', color: 'white', fontSize: '1.6rem' }}>
                    Professor Vinculado: {teacher?.nome || 'Carregando...'}
                  </h1>
                  <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
                    Contato: {teacher?.email} • Abaixo estão as listas de materiais disponibilizadas para você.
                  </p>
                </div>
              </div>
            </div>

            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-h)' }}>Listas de Materiais Clínicos</h2>

            {loading ? <p>Carregando listas de materiais...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {listas.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <BookOpen size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1.1rem' }}>Nenhuma lista de materiais cadastrada por este professor ainda.</p>
                  </div>
                ) : (
                  listas.map(lista => {
                    const isExpanded = expandedListId === lista.id;
                    const details = listDetails[lista.id];

                    return (
                      <div key={lista.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        {/* Accordion Header */}
                        <div 
                          onClick={() => toggleExpand(lista.id)}
                          style={{ 
                            padding: '1.5rem', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            cursor: 'pointer',
                            background: isExpanded ? 'var(--accent-bg)' : 'white',
                            transition: '0.2s'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-h)' }}>{lista.nome}</h3>
                              {lista.semestre && (
                                <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.75rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>
                                  {lista.semestre}
                                </span>
                              )}
                            </div>
                            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                              {lista.descricao || 'Sem descrição.'}
                            </p>
                          </div>
                          
                          <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                          </div>
                        </div>

                        {/* Accordion Body */}
                        {isExpanded && (
                          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: '#fafafa' }}>
                            {!details ? <p>Carregando materiais...</p> : (
                              <div>
                                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-h)' }}>Produtos Necessários:</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                  {details.itens.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                                      <div>
                                        <strong style={{ color: 'var(--text-h)' }}>{item.produto_name || item.produto_nome}</strong>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>{item.produto_marca}</span>
                                        {item.observacao && (
                                          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontStyle: 'italic', display: 'block', marginTop: '0.25rem' }}>
                                            Nota do Professor: {item.observacao}
                                          </span>
                                        )}
                                      </div>
                                      <div style={{ padding: '0.25rem 0.75rem', background: 'var(--accent-bg)', borderRadius: '4px', fontWeight: '700', color: 'var(--primary)', fontSize: '0.9rem' }}>
                                        Qtd: {item.quantidade}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                  <button 
                                    onClick={() => handleImportList(lista.id)}
                                    className="btn-primary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
                                  >
                                    <ShoppingBag size={18} /> Iniciar Cotação desta Lista <ArrowRight size={18} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
