import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { ClipboardList, Plus, Trash2, Calendar, Share2, AlertCircle, Users, UserMinus, CheckCircle, X } from 'lucide-react';

export default function ListasAcademicas() {
  const { user } = useContext(AuthContext);
  const [listas, setListas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAlunos, setLoadingAlunos] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  // Modal de confirmação genérico
  const [modal, setModal] = useState(null);
  // modal = { title, message, onConfirm }

  async function loadListas() {
    try {
      const res = await api.get('/listas');
      setListas(res.data);
    } catch (err) {
      console.error('Erro ao carregar listas:', err);
      setError('Não foi possível carregar as listas de materiais.');
    } finally {
      setLoading(false);
    }
  }

  async function loadAlunos() {
    try {
      const res = await api.get('/listas/alunos');
      setAlunos(res.data);
    } catch (err) {
      console.error('Erro ao carregar alunos vinculados:', err);
    } finally {
      setLoadingAlunos(false);
    }
  }

  useEffect(() => {
    loadListas();
    loadAlunos();
  }, []);

  function askConfirm(title, message, onConfirm) {
    setModal({ title, message, onConfirm });
  }

  function handleDelete(id) {
    askConfirm(
      'Excluir Lista',
      'Tem certeza que deseja excluir esta lista? Todos os alunos vinculados perderão o acesso a ela.',
      async () => {
        setModal(null);
        setError('');
        setSuccessMsg('');
        try {
          await api.delete(`/listas/${id}`);
          setListas(listas.filter(l => l.id !== id));
          setSuccessMsg('Lista removida com sucesso!');
        } catch (err) {
          console.error('Erro ao excluir lista:', err);
          setError('Erro ao excluir a lista. Tente novamente.');
        }
      }
    );
  }

  function handleUnlinkAluno(alunoId, alunoNome) {
    askConfirm(
      'Desvincular Aluno',
      `Tem certeza que deseja desvincular o aluno ${alunoNome}? Ele perderá acesso às suas listas.`,
      async () => {
        setModal(null);
        setError('');
        setSuccessMsg('');
        try {
          await api.post('/listas/desvincular-aluno', { studentId: alunoId });
          setAlunos(alunos.filter(a => a.id !== alunoId));
          setSuccessMsg(`Aluno ${alunoNome} desvinculado com sucesso!`);
        } catch (err) {
          console.error('Erro ao desvincular aluno:', err);
          setError(err.response?.data?.error || 'Erro ao desvincular o aluno.');
        }
      }
    );
  }

  return (
    <>
      <Navbar />
      <main className="page-container">

        {/* Modal de confirmação inline */}
        {modal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', maxWidth: '440px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: '#fee2e2', padding: '0.5rem', borderRadius: '50%' }}>
                  <AlertCircle size={24} color="#ef4444" />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>{modal.title}</h2>
              </div>
              <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.5' }}>{modal.message}</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setModal(null)}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', color: '#475569', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={modal.onConfirm}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: '600' }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem de erro */}
        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c' }}><X size={16} /></button>
          </div>
        )}

        {/* Mensagem de sucesso */}
        {successMsg && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534' }}><X size={16} /></button>
          </div>
        )}

        {/* Banner com o Código do Professor */}
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, #0d9488 100%)', 
          color: 'white', 
          padding: '2rem', 
          borderRadius: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 10px 15px -3px rgba(13, 148, 136, 0.2)'
        }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '1.75rem' }}>Olá, Professor {user?.nome}!</h1>
            <p style={{ margin: 0, opacity: 0.9 }}>Crie listas de materiais para suas turmas. Seus alunos podem importá-las para cotar diretamente com os fornecedores.</p>
          </div>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.15)', 
            backdropFilter: 'blur(8px)',
            padding: '1rem 1.5rem', 
            borderRadius: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', opacity: 0.9, fontWeight: '700' }}>
              Código de Acesso dos Alunos
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <Share2 size={18} />
              <strong style={{ fontSize: '1.5rem', letterSpacing: '0.05em' }}>{user?.codigo_acesso}</strong>
            </div>
          </div>
        </div>

        {/* Cabeçalho da Seção */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--text-h)' }}>Minhas Listas Acadêmicas</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gerencie os materiais exigidos por semestre ou turma.</p>
          </div>
          <button 
            onClick={() => navigate('/professor/criar-lista')}
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
          >
            <Plus size={20} /> Nova Lista
          </button>
        </div>

        {/* Listagem */}
        {loading ? <p>Carregando listas acadêmicas...</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {listas.length === 0 ? (
              <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                <ClipboardList size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Você ainda não criou nenhuma lista acadêmica.</p>
                <button 
                  onClick={() => navigate('/professor/criar-lista')}
                  className="btn-secondary" 
                  style={{ marginTop: '0.5rem' }}
                >
                  Criar minha primeira lista
                </button>
              </div>
            ) : (
              listas.map(lista => (
                <div key={lista.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', position: 'relative' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-h)', fontWeight: '700' }}>{lista.nome}</h3>
                      {lista.semestre && (
                        <span style={{ 
                          background: 'var(--accent-bg)', 
                          color: 'var(--primary)', 
                          fontSize: '0.75rem', 
                          fontWeight: '700',
                          padding: '2px 8px', 
                          borderRadius: '6px' 
                        }}>{lista.semestre}</span>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.4', minHeight: '40px' }}>
                      {lista.descricao || 'Sem descrição fornecida.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} /> {new Date(lista.created_at).toLocaleDateString()}
                    </span>
                    <button 
                      onClick={() => handleDelete(lista.id)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--danger)', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.25rem',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}
                    >
                      <Trash2 size={16} /> Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Seção de Alunos Vinculados */}
        <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, color: 'var(--text-h)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={24} color="var(--primary)" /> Alunos Vinculados
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Estudantes que se vincularam utilizando o seu código de acesso.
            </p>
          </div>

          {loadingAlunos ? (
            <p>Carregando alunos vinculados...</p>
          ) : alunos.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Users size={40} color="var(--border)" style={{ marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '1rem', fontWeight: '500', margin: 0 }}>Nenhum aluno vinculado a você no momento.</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Compartilhe o código <strong>{user?.codigo_acesso}</strong> com sua turma.
              </p>
            </div>
          ) : (
            <div className="card" style={{ padding: '1rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-h)', fontWeight: '600' }}>Nome</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-h)', fontWeight: '600' }}>E-mail</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-h)', fontWeight: '600', textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {alunos.map(aluno => (
                    <tr key={aluno.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-h)', fontWeight: '500' }}>{aluno.nome}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{aluno.email}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleUnlinkAluno(aluno.id, aluno.nome)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontWeight: '600',
                            fontSize: '0.85rem'
                          }}
                        >
                          <UserMinus size={16} /> Desvincular
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
