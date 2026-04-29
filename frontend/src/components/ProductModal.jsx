import React, { useState } from 'react';
import { X, PlusCircle, ShoppingBag } from 'lucide-react';

export default function ProductModal({ isOpen, onClose, onSave, categoriaNome }) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nome.trim()) return;

    setLoading(true);
    try {
      await onSave({ nome, descricao });
      setNome('');
      setDescricao('');
      onClose();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
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
        maxWidth: '500px',
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
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Novo Produto / Utensílio</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Categoria: {categoriaNome}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          <div className="input-group">
            <label htmlFor="prod-nome">Nome do Produto</label>
            <div style={{ position: 'relative' }}>
              <ShoppingBag size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                style={{ paddingLeft: '2.5rem' }}
                type="text" 
                id="prod-nome" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Broca 1012, Resina A1, Fio de Sutura..."
                autoFocus
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="prod-desc">Descrição / Especificações</label>
            <textarea 
              id="prod-desc" 
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes técnicos, marca, tamanho..."
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                border: '1px solid var(--border)', 
                borderRadius: '0.5rem', 
                minHeight: '100px',
                fontFamily: 'inherit'
              }}
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
                <><PlusCircle size={18} /> Adicionar Item</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
