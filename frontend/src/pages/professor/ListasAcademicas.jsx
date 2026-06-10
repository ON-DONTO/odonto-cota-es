import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { ClipboardList, Plus, Trash2, Calendar, Share2, AlertCircle } from 'lucide-react';

export default function ListasAcademicas() {
  const { user } = useContext(AuthContext);
  const [listas, setListas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  useEffect(() => {
    loadListas();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Tem certeza que deseja excluir esta lista? Todos os alunos vinculados perderão o acesso a ela.')) {
      return;
    }

    try {
      await api.delete(`/listas/${id}`);
      setListas(listas.filter(l => l.id !== id));
      alert('Lista removida com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir lista:', err);
      alert('Erro ao excluir a lista. Tente novamente.');
    }
  }

  return (
    <>
      <Navbar />
      <main className="page-container">
        
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

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

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
                <div key={lista.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', padding: '1.5rem', position: 'relative' }}>
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
      </main>
    </>
  );
}
