import React, { createContext, useState, useContext } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, HelpCircle } from 'lucide-react';

const AlertContext = createContext({});

export function AlertProvider({ children }) {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success', // 'success' | 'error' | 'warning' | 'info' | 'question'
    isConfirm: false,
    confirmText: 'OK',
    cancelText: 'Cancelar',
    onConfirm: null,
    onCancel: null,
  });

  function showAlert(message, type = 'info', title = '', onConfirm = null, isConfirm = false, onCancel = null, confirmText = 'OK', cancelText = 'Cancelar') {
    if (typeof message === 'object' && message !== null) {
      const { 
        message: msg, 
        type: t, 
        title: tit, 
        onConfirm: confirm, 
        isConfirm: isConf, 
        onCancel: cancel, 
        confirmText: cText, 
        cancelText: canText 
      } = message;

      setAlertState({
        isOpen: true,
        message: msg || '',
        type: t || 'info',
        title: tit || getDefaultTitle(t),
        onConfirm: confirm || null,
        isConfirm: isConf || false,
        onCancel: cancel || null,
        confirmText: cText || (isConf ? 'Confirmar' : 'OK'),
        cancelText: canText || 'Cancelar',
      });
    } else {
      setAlertState({
        isOpen: true,
        message,
        type,
        title: title || getDefaultTitle(type),
        onConfirm,
        isConfirm,
        onCancel,
        confirmText: confirmText || (isConfirm ? 'Confirmar' : 'OK'),
        cancelText: cancelText || 'Cancelar',
      });
    }
  }

  function getDefaultTitle(type) {
    switch (type) {
      case 'success': return 'Sucesso!';
      case 'error': return 'Erro';
      case 'warning': return 'Atenção';
      case 'question': return 'Confirmação';
      default: return 'Informação';
    }
  }

  function handleConfirm() {
    setAlertState(prev => ({ ...prev, isOpen: false }));
    if (alertState.onConfirm) {
      try {
        alertState.onConfirm();
      } catch (err) {
        console.error(err);
      }
    }
  }

  function handleCancel() {
    setAlertState(prev => ({ ...prev, isOpen: false }));
    if (alertState.onCancel) {
      try {
        alertState.onCancel();
      } catch (err) {
        console.error(err);
      }
    }
  }

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alertState.isOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget && !alertState.isConfirm) handleCancel(); }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(6px)',
            animation: 'alertFadeIn 0.2s ease'
          }}
        >
          <div style={{
            background: 'var(--card-bg, #fff)',
            borderRadius: '1.25rem',
            padding: '2.5rem',
            maxWidth: '440px',
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            animation: 'alertSlideUp 0.25s ease',
            textAlign: 'center',
            border: '1px solid var(--border)'
          }}>
            {/* Icon */}
            <div style={{
              width: '64px', height: '64px',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              ...getIconStyles(alertState.type)
            }}>
              {getIcon(alertState.type)}
            </div>

            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.3rem', color: 'var(--text-h)', fontWeight: '700' }}>
              {alertState.title}
            </h3>

            <p style={{ color: 'var(--text-muted)', margin: '0 0 2rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
              {alertState.message}
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {alertState.isConfirm && (
                <button
                  onClick={handleCancel}
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    padding: '0.85rem',
                    fontSize: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontWeight: '600',
                    color: 'var(--text)'
                  }}
                >
                  {alertState.cancelText}
                </button>
              )}
              <button
                onClick={handleConfirm}
                className="btn-primary"
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  fontSize: '1rem',
                  justifyContent: 'center',
                  background: alertState.type === 'error' ? 'var(--danger)' : 'var(--primary)'
                }}
              >
                {alertState.confirmText}
              </button>
            </div>
          </div>

          <style>{`
            @keyframes alertFadeIn {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
            @keyframes alertSlideUp {
              from { opacity: 0; transform: translateY(20px) scale(0.98); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
        </div>
      )}
    </AlertContext.Provider>
  );
}

function getIcon(type) {
  switch (type) {
    case 'success': return <CheckCircle2 size={32} />;
    case 'error': return <XCircle size={32} />;
    case 'warning': return <AlertTriangle size={32} />;
    case 'question': return <HelpCircle size={32} />;
    default: return <Info size={32} />;
  }
}

function getIconStyles(type) {
  switch (type) {
    case 'success': return { background: '#ecfdf5', color: '#059669' };
    case 'error': return { background: '#fef2f2', color: '#dc2626' };
    case 'warning': return { background: '#fffbeb', color: '#d97706' };
    case 'question': return { background: '#eff6ff', color: '#2563eb' };
    default: return { background: '#f1f5f9', color: '#64748b' };
  }
}

export function useAlert() {
  return useContext(AlertContext);
}
