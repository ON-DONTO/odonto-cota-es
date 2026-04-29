import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, LogIn, LogOut, User, LayoutDashboard } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

export default function Navbar() {
  const { signed, user, signOut } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    signOut();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <Stethoscope size={28} />
        <span>Odonto Cota ES</span>
      </Link>
      
      <div className="nav-links">
        {signed ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingRight: '1rem', borderRight: '1px solid var(--border)' }}>
              <div style={{ background: 'var(--accent-bg)', padding: '0.4rem', borderRadius: '50%', color: 'var(--primary)' }}>
                <User size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-h)' }}>{user.nome}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.tipo}</span>
              </div>
            </div>

            <button 
              onClick={handleLogout} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}
            >
              <LogOut size={18} />
              <span>Sair</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/register" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: '600', fontSize: '0.9rem' }}>
              Criar Conta
            </Link>
            <Link to="/login" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
              <LogIn size={18} />
              <span>Entrar</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
