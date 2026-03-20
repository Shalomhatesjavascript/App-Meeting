// ============================================
// Input Component
// ============================================

import React, { useState } from 'react';

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  hint,
  disabled = false,
  required = false,
  icon,
  rightElement,
  name,
  autoComplete,
  style: extraStyle = {},
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    ...extraStyle,
  };

  const labelStyle = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: error ? 'var(--color-coral)' : 'var(--text-secondary)',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  };

  const wrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#fff',
    border: `2px solid ${error ? 'var(--color-coral)' : focused ? 'var(--color-navy)' : 'var(--border-medium)'}`,
    borderRadius: 'var(--radius-md)',
    padding: '0.65rem 0.875rem',
    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
    boxShadow: focused && !error ? '0 0 0 3px rgba(18, 23, 74, 0.08)' : 'none',
  };

  const inputStyle = {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9375rem',
    color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
    lineHeight: 1.5,
    minWidth: 0,
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label style={labelStyle}>
          {label}{required && <span style={{ color: 'var(--color-coral)', marginLeft: '3px' }}>*</span>}
        </label>
      )}
      <div style={wrapperStyle}>
        {icon && (
          <span style={{ color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }}>
            {icon}
          </span>
        )}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          name={name}
          autoComplete={autoComplete}
          style={inputStyle}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(p => !p)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        {rightElement && !isPassword && (
          <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{rightElement}</span>
        )}
      </div>
      {error && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-coral)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={12} /> {error}
        </p>
      )}
      {hint && !error && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{hint}</p>
      )}
    </div>
  );
}

export function Textarea({
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  rows = 4,
  maxLength,
  required = false,
  style: extraStyle = {},
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', ...extraStyle }}>
      {label && (
        <label style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: error ? 'var(--color-coral)' : 'var(--text-secondary)',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}>
          {label}{required && <span style={{ color: 'var(--color-coral)', marginLeft: '3px' }}>*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        required={required}
        style={{
          border: `2px solid ${error ? 'var(--color-coral)' : focused ? 'var(--color-navy)' : 'var(--border-medium)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 0.875rem',
          fontFamily: 'var(--font-body)',
          fontSize: '0.9375rem',
          color: 'var(--text-primary)',
          lineHeight: 1.6,
          resize: 'vertical',
          outline: 'none',
          background: '#fff',
          transition: 'border-color var(--transition-fast)',
          boxShadow: focused ? '0 0 0 3px rgba(18, 23, 74, 0.08)' : 'none',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {maxLength && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
          {value?.length || 0}/{maxLength}
        </p>
      )}
      {error && <p style={{ fontSize: '0.8125rem', color: 'var(--color-coral)' }}>{error}</p>}
      {hint && !error && <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  );
}

// Inline icon components
function Eye({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function AlertCircle({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
