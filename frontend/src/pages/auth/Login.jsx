import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Stethoscope } from 'lucide-react';

export default function Login() {
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao realizar login. Tente novamente.');
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <Stethoscope size={48} color="var(--primary)" />
          <h2>Odonto Cota ES</h2>
          <p>Acesse o sistema com suas credenciais.</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@clinica.com"
              required 
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Entrar no Sistema
          </button>
        </form>
      </div>
    </div>
  );
}
