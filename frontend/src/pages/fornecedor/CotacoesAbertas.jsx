import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { ClipboardList, User, Calendar, ArrowRight, Store } from 'lucide-react';

export default function CotacoesAbertas() {
  const [cotacoes, setCotacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function loadCotacoes() {
    try {
      const res = await api.get('/cotacoes/abertas');
      setCotacoes(res.data);
    } catch (error) {
      console.error('Erro ao buscar cotações abertas:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCotacoes();
  }, []);

  return (
    <>
      <Navbar />
      <main className="page-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '1rem' }}>
            <Store size={32} />
          </div>
          <div>
            <h1 style={{ margin: 0, color: 'var(--text-h)' }}>Painel de Vendas</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Veja as oportunidades de cotação disponíveis agora.</p>
          </div>
        </div>

        {loading ? <p>Carregando cotações...</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {cotacoes.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                <ClipboardList size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>Não há cotações abertas no momento. Volte em breve!</p>
              </div>
            ) : (
              cotacoes.map(cota => (
                <div key={cota.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', transition: 'transform 0.2s' }}>
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Cotação</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--text-h)' }}>#{cota.id.slice(0, 8)}</strong>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <User size={16} />
                        <span style={{ fontSize: '0.9rem' }}>{cota.dentista_nome}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <Calendar size={16} />
                        <span style={{ fontSize: '0.9rem' }}>{new Date(cota.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {cota.observacoes && (
                      <div style={{ maxWidth: '300px', padding: '0.5rem 1rem', background: '#fff9c4', borderRadius: '0.5rem', fontSize: '0.85rem', color: '#5d4037', borderLeft: '4px solid #fbc02d' }}>
                        <strong>Obs:</strong> {cota.observacoes}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => navigate(`/fornecedor/responder/${cota.id}`)}
                    className="btn-primary" 
                    style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    Responder Cotação <ArrowRight size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </>
  );
}
