import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';

export default function CategoryModal({ isOpen, onClose, onSave, areaNome }) {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nome.trim()) return;

    setLoading(true);
    try {
      await onSave(nome);
      setNome('');
      onClose();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        width: '100%',
        maxWidth: '450px',
        borderRadius: '1rem',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg)'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Nova Categoria</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Área: {areaNome}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          <div className="input-group">
            <label htmlFor="cat-nome">Nome da Categoria</label>
            <input 
              type="text" 
              id="cat-nome" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Luvas, Brocas, Resinas..."
              autoFocus
              required 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{ 
                flex: 1, 
                padding: '0.75rem', 
                borderRadius: '0.5rem', 
                border: '1px solid var(--border)', 
                background: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? 'Salvando...' : (
                <><PlusCircle size={18} /> Criar Categoria</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
