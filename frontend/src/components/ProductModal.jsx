import React, { useState, useRef } from 'react';
import { X, PlusCircle, ShoppingBag, Upload, Image } from 'lucide-react';
import api from '../services/api';
import { useAlert } from '../contexts/AlertContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ProductModal({ isOpen, onClose, onSave, categoriaNome }) {
  const { showAlert } = useAlert();
  const [nome, setNome] = useState('');

  const [descricao, setDescricao] = useState('');
  const [preview, setPreview] = useState(null);     // URL local para preview
  const [imageUrl, setImageUrl] = useState('');      // URL final após upload
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  function handleClose() {
    setNome('');
    setDescricao('');
    setPreview(null);
    setImageUrl('');
    onClose();
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Mostra preview imediato
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setImageUrl('');

    // Faz upload para o backend
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('imagem', file);
      const res = await api.post('/upload/produto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(res.data.url); // ex: /uploads/produto-12345.jpg
    } catch (err) {
      showAlert('Erro ao fazer upload da imagem. Tente novamente.', 'error');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nome.trim()) return;
    if (uploading) {
      showAlert('Aguarde o upload da imagem terminar.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await onSave({ nome, descricao, imagem_url: imageUrl || undefined });
      setNome('');
      setDescricao('');
      setPreview(null);
      setImageUrl('');
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
        overflow: 'hidden',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg)',
          position: 'sticky',
          top: 0,
          zIndex: 1
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Novo Produto / Utensílio</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Categoria: {categoriaNome}</p>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          {/* Nome */}
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

          {/* Descrição */}
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
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Upload de Imagem */}
          <div className="input-group">
            <label>Imagem do Produto</label>

            {/* Área de preview / clique */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${preview ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: '0.75rem',
                padding: '1rem',
                cursor: 'pointer',
                textAlign: 'center',
                background: preview ? 'var(--accent-bg)' : '#fafafa',
                transition: 'all 0.2s',
                position: 'relative',
                minHeight: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Preview"
                    style={{ maxHeight: '130px', maxWidth: '100%', objectFit: 'contain', borderRadius: '0.5rem' }}
                  />
                  {uploading && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(255,255,255,0.85)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--primary)',
                      fontSize: '0.9rem'
                    }}>
                      ⏳ Enviando imagem...
                    </div>
                  )}
                  {!uploading && imageUrl && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>
                      ✅ Imagem salva! Clique para trocar.
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Image size={40} color="var(--border)" />
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Clique para selecionar uma imagem
                  </p>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    PNG, JPG, WebP — até 5 MB
                  </p>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={handleClose}
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
              disabled={loading || uploading}
            >
              {loading ? 'Salvando...' : uploading ? 'Aguardando upload...' : (
                <><PlusCircle size={18} /> Adicionar Item</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
