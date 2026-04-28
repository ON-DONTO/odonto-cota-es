import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, LogIn, LogOut } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

export default function Navbar() {
  const { signed, signOut } = useContext(AuthContext);
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
          <button 
            onClick={handleLogout} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', fontSize: '1rem' }}
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
            <LogIn size={20} />
            <span>Área Restrita</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
