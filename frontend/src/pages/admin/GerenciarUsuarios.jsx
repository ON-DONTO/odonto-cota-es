import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import { User, Trash2, Shield, UserCheck, Search } from 'lucide-react';

export default function GerenciarUsuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  async function loadUsers() {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleDelete(id, nome) {
    if (!window.confirm(`Deseja realmente remover o usuário "${nome}"?`)) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      alert('Usuário removido com sucesso.');
    } catch (error) {
      alert('Erro ao remover usuário.');
    }
  }

  const filteredUsers = users.filter(u => 
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main className="page-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ margin: 0, color: 'var(--text-h)' }}>Gestão de Usuários</h1>
            <p style={{ color: 'var(--text-muted)' }}>Administre quem tem acesso à plataforma.</p>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '300px', borderRadius: '0.75rem', border: '1px solid var(--border)' }}
            />
          </div>
        </div>

        {loading ? <p>Carregando usuários...</p> : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: 'var(--accent-bg)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1.25rem' }}>Nome</th>
                  <th style={{ padding: '1.25rem' }}>E-mail</th>
                  <th style={{ padding: '1.25rem' }}>Tipo</th>
                  <th style={{ padding: '1.25rem' }}>Data Cadastro</th>
                  <th style={{ padding: '1.25rem', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ background: 'var(--bg)', padding: '0.5rem', borderRadius: '50%' }}>
                          {u.tipo === 'admin' ? <Shield size={18} color="var(--primary)" /> : <User size={18} color="var(--text-muted)" />}
                        </div>
                        <span style={{ fontWeight: '600' }}>{u.nome}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '1.25rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem', 
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        background: u.tipo === 'admin' ? '#fef3c7' : u.tipo === 'fornecedor' ? '#dcfce7' : '#e0f2fe',
                        color: u.tipo === 'admin' ? '#92400e' : u.tipo === 'fornecedor' ? '#166534' : '#075985'
                      }}>
                        {u.tipo}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                      {u.tipo !== 'admin' && (
                        <button 
                          onClick={() => handleDelete(u.id, u.nome)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.5rem' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
