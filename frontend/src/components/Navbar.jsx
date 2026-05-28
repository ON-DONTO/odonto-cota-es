import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, LogIn, LogOut, User, ClipboardList, Store, Notebook, UserCheck } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';

export default function Navbar() {
  const { signed, user, signOut } = useContext(AuthContext);
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  function handleLogout() {
    signOut();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link to={user?.tipo === 'fornecedor' ? "/fornecedor" : "/"} className="nav-brand">
        <Stethoscope size={28} />
        <span>On Donto</span>
      </Link>
      
      <div className="nav-links">
        {signed ? (
          <>
            {user.tipo === 'cliente' && (
              <Link to="/minhas-cotacoes" className="nav-item" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text)', fontWeight: '600', marginRight: '1rem' }}>
                <Notebook size={20} />
                <span>Minha Lista</span>
                {cart.length > 0 && (
                  <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary)', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', minWidth: '18px', textAlign: 'center' }}>
                    {cart.length}
                  </span>
                )}
              </Link>
            )}

            {user.tipo === 'fornecedor' && (
              <Link to="/fornecedor" className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text)', fontWeight: '600', marginRight: '1rem' }}>
                <Store size={20} />
                <span>Painel de Vendas</span>
              </Link>
            )}
            
            {user.tipo === 'admin' && (
              <>
                <Link to="/" className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text)', fontWeight: '600', marginRight: '1rem' }}>
                  <ClipboardList size={20} />
                  <span>Gerenciar Catálogo</span>
                </Link>
                <Link to="/admin/usuarios" className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text)', fontWeight: '600', marginRight: '1rem' }}>
                  <UserCheck size={20} />
                  <span>Gerenciar Usuários</span>
                </Link>
              </>
            )}
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
