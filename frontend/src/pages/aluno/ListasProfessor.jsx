import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext';
import { BookOpen, Key, CheckCircle, ChevronDown, ChevronUp, AlertCircle, ShoppingBag, ArrowRight, User, UserMinus, X } from 'lucide-react';

export default function ListasProfessor() {
  const { user, updateUser } = useContext(AuthContext);
  const { importListToCart } = useContext(CartContext);
  
  const [codigoInput, setCodigoInput] = useState('');
  const [teacher, setTeacher] = useState(null);
  const [listas, setListas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [expandedListId, setExpandedListId] = useState(null);
  const [listDetails, setListDetails] = useState({});
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);

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
    setSuccessMsg('');
    setLinking(true);

    try {
      const res = await api.post('/listas/vincular', { codigo: codigoInput });
      updateUser({ professor_id: res.data.professor_id });
      setCodigoInput('');
      setSuccessMsg('Professor vinculado com sucesso!');
    } catch (err) {
      console.error('Erro ao vincular professor:', err);
      setError(err.response?.data?.error || 'Código inválido ou erro de conexão.');
    } finally {
      setLinking(false);
    }
  }

  async function confirmUnlink() {
    setShowUnlinkConfirm(false);
    setUnlinking(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.post('/listas/desvincular');
      updateUser({ professor_id: null });
      setTeacher(null);
      setListas([]);
      setSuccessMsg('Desvinculado do professor com sucesso!');
    } catch (err) {
      console.error('Erro ao desvincular professor:', err);
      const msg = err.response?.data?.error || err.message || 'Erro desconhecido';
      setError(`Erro ao desvincular: ${msg}`);
    } finally {
      setUnlinking(false);
    }
  }

  async function toggleExpand(listId) {
    if (expandedListId === listId) {
      setExpandedListId(null);
      return;
    }

    setExpandedListId(listId);

    if (listDetails[listId]) return;

    try {
      const res = await api.get(`/listas/${listId}`);
      setListDetails(prev => ({
        ...prev,
        [listId]: res.data
      }));
    } catch (err) {
      console.error('Erro ao carregar itens da lista:', err);
      setError('Não foi possível carregar os itens desta lista.');
    }
  }

  function handleImportList(listaId) {
    const details = listDetails[listaId];
    if (!details || !details.itens || details.itens.length === 0) {
      setError('Carregando itens da lista... Por favor, aguarde.');
      return;
    }

    const cartProducts = details.itens.map(item => ({
      id: item.produto_id,
      nome: item.produto_nome,
      marca: item.produto_marca || 'Sem Marca',
      quantidade: item.quantidade
    }));

    importListToCart(cartProducts);
    setSuccessMsg('Produtos adicionados à sua lista de cotação!');
    setTimeout(() => navigate('/minhas-cotacoes'), 1000);
  }

  return (
    <>
      <Navbar />
      <main className="page-container">

        {/* Mensagem de erro global */}
        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c' }}><X size={16} /></button>
          </div>
        )}

        {/* Mensagem de sucesso global */}
        {successMsg && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534' }}><X size={16} /></button>
          </div>
        )}

        {/* Modal de confirmação de desvincular */}
        {showUnlinkConfirm && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', maxWidth: '440px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: '#fee2e2', padding: '0.5rem', borderRadius: '50%' }}>
                  <UserMinus size={24} color="#ef4444" />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Desvincular Professor</h2>
              </div>
              <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Tem certeza? Você perderá o acesso às listas de materiais do professor <strong>{teacher?.nome}</strong>.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowUnlinkConfirm(false)}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', color: '#475569', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmUnlink}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <UserMinus size={16} /> Sim, desvincular
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Se o aluno ainda não estiver vinculado a um professor */}
        {!user?.professor_id ? (
          <div style={{ maxWidth: '600px', margin: '3rem auto 0' }}>
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ background: 'var(--accent-bg)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
                <Key size={32} />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-h)' }}>Vincular ao seu Professor</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.5' }}>
                Digite o código de acesso compartilhado pelo seu professor (ex: <code>PROF-XXXXXX</code>) para visualizar e cotar a lista de materiais exigidos para as aulas.
              </p>

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
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem'
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
              <button
                onClick={() => setShowUnlinkConfirm(true)}
                disabled={unlinking}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  background: unlinking ? '#9ca3af' : '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: unlinking ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <UserMinus size={18} /> {unlinking ? 'Desvinculando...' : 'Desvincular Professor'}
              </button>
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
