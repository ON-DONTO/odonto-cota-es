import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Stethoscope, User, Mail, Lock, UserCircle } from 'lucide-react';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('cliente');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await api.post('/auth/register', { nome, email, senha, tipo });
      alert('Conta criada com sucesso! Faça login para continuar.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container" style={{ background: 'var(--bg)' }}>
      <div className="login-box" style={{ maxWidth: '450px' }}>
        <div className="login-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Stethoscope size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Crie sua Conta</h2>
          <p style={{ color: 'var(--text-muted)' }}>Junte-se à maior rede odontológica do ES.</p>
        </div>

        <form onSubmit={handleRegister} className="login-form">
          {error && (
            <div style={{ 
              background: '#fee2e2', 
              color: '#b91c1c', 
              padding: '0.75rem', 
              borderRadius: '0.5rem', 
              marginBottom: '1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          <div className="input-group">
            <label htmlFor="nome">Nome Completo</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                style={{ paddingLeft: '2.5rem' }}
                type="text" 
                id="nome" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome ou nome da clínica"
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">E-mail Profissional</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                style={{ paddingLeft: '2.5rem' }}
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@clinica.com"
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="tipo">Eu sou um:</label>
            <div style={{ position: 'relative' }}>
              <UserCircle size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <select 
                id="tipo" 
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                style={{ paddingLeft: '2.5rem', appearance: 'none', background: 'white' }}
                required
              >
                <option value="cliente">Dentista / Clínica (Comprador)</option>
                <option value="fornecedor">Distribuidor / Vendedor (Fornecedor)</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                style={{ paddingLeft: '2.5rem' }}
                type="password" 
                id="password" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Crie uma senha forte"
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Finalizar Cadastro'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Já tem uma conta? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Fazer Login</Link>
        </div>
      </div>
    </div>
  );
}
