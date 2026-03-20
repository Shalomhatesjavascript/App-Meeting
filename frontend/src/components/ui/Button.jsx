// ============================================
// Button Component
// ============================================

import React from 'react';

const variantStyles = {
  primary: {
    background: 'var(--color-navy)',
    color: 'var(--text-inverse)',
    border: '2px solid var(--color-navy)',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--color-navy)',
    border: '2px solid var(--color-navy)',
  },
  amber: {
    background: 'var(--color-amber)',
    color: 'var(--color-navy)',
    border: '2px solid var(--color-amber)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '2px solid transparent',
  },
  danger: {
    background: 'var(--color-coral)',
    color: '#fff',
    border: '2px solid var(--color-coral)',
  },
};

const sizeStyles = {
  sm: { padding: '0.4rem 1rem', fontSize: '0.875rem', borderRadius: 'var(--radius-sm)' },
  md: { padding: '0.65rem 1.5rem', fontSize: '0.9375rem', borderRadius: 'var(--radius-md)' },
  lg: { padding: '0.85rem 2rem', fontSize: '1rem', borderRadius: 'var(--radius-md)' },
  xl: { padding: '1rem 2.5rem', fontSize: '1.0625rem', borderRadius: 'var(--radius-lg)' },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  onClick,
  type = 'button',
  style: extraStyle = {},
  className = '',
}) {
  const vStyle = variantStyles[variant] || variantStyles.primary;
  const sStyle = sizeStyles[size] || sizeStyles.md;

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all var(--transition-fast)',
    width: fullWidth ? '100%' : 'auto',
    letterSpacing: '0.01em',
    userSelect: 'none',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
    ...vStyle,
    ...sStyle,
    ...extraStyle,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={baseStyle}
      className={`btn ${className}`}
      onMouseEnter={e => {
        if (!disabled && !loading) {
          e.currentTarget.style.filter = 'brightness(0.92)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.filter = '';
        e.currentTarget.style.transform = '';
      }}
      onMouseDown={e => {
        e.currentTarget.style.transform = 'scale(0.98)';
      }}
      onMouseUp={e => {
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LoadingSpinner size={16} color="currentColor" />
          {typeof children === 'string' ? 'Loading...' : children}
        </span>
      ) : (
        <>
          {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}

function LoadingSpinner({ size = 16, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
