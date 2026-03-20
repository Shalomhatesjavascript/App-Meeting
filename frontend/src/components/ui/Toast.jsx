// ============================================
// Toast Notification
// ============================================

import React from 'react';
import { useApp } from '../../context/AppContext';

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  const colors = {
    success: { bg: 'var(--color-sage)', icon: '✓' },
    error: { bg: 'var(--color-coral)', icon: '✕' },
    info: { bg: 'var(--color-navy)', icon: 'ℹ' },
    warning: { bg: 'var(--color-amber)', icon: '!' },
  };

  const config = colors[toast.type] || colors.info;

  return (
    <div style={{
      position: 'fixed',
      bottom: '5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 'var(--z-toast)',
      animation: 'fadeSlideUp 0.3s both',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        background: config.bg,
        color: '#fff',
        padding: '0.75rem 1.25rem',
        borderRadius: 'var(--radius-full)',
        boxShadow: 'var(--shadow-lg)',
        fontSize: '0.875rem',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        maxWidth: '90vw',
      }}>
        <span style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          fontWeight: 700,
          flexShrink: 0,
        }}>
          {config.icon}
        </span>
        {toast.message}
      </div>
    </div>
  );
}
