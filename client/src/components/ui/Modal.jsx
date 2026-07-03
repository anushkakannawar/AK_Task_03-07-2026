import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../context/ThemeContext';
import { getColors } from '../../utils/theme';

const sizes = { sm: '440px', md: '540px', lg: '720px', xl: '900px' };

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const overlayRef = useRef(null);
  const modalRef   = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const fn = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && modalRef.current) modalRef.current.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog" aria-modal="true" aria-labelledby="modal-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        background: isDark ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        style={{
          background: C.modalBg,
          border: `1px solid ${C.modalBorder}`,
          borderRadius: '16px',
          boxShadow: isDark ? '0 32px 80px rgba(0,0,0,0.6)' : '0 16px 48px rgba(0,0,0,0.18)',
          width: '100%', maxWidth: sizes[size] || sizes.md,
          maxHeight: '88vh', display: 'flex', flexDirection: 'column',
          outline: 'none',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${C.border}` }}>
          <h2 id="modal-title" style={{ color: C.text1, fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: C.panel, border: `1px solid ${C.border}`,
              borderRadius: '6px', padding: '5px', cursor: 'pointer',
              color: C.text3, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = C.hover; e.currentTarget.style.color = C.text1; }}
            onMouseOut={e =>  { e.currentTarget.style.background = C.panel; e.currentTarget.style.color = C.text3; }}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px', color: C.text2 }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
