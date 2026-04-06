import { useId, useState } from 'react'

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
  const generatedInputId = useId()
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const inputId = name || generatedInputId

  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    ...extraStyle,
  }

  const labelStyle = {
    color: error ? 'var(--color-coral)' : 'var(--text-secondary)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.8125rem',
    fontWeight: 500,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  }

  const wrapperStyle = {
    alignItems: 'center',
    background: '#fff',
    border: `2px solid ${error ? 'var(--color-coral)' : focused ? 'var(--color-navy)' : 'var(--border-medium)'}`,
    borderRadius: 'var(--radius-md)',
    boxShadow: focused && !error ? '0 0 0 3px rgba(18, 23, 74, 0.08)' : 'none',
    display: 'flex',
    gap: '0.5rem',
    padding: '0.65rem 0.875rem',
    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
  }

  const inputStyle = {
    background: 'transparent',
    border: 'none',
    color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
    flex: 1,
    fontFamily: 'var(--font-body)',
    fontSize: '0.9375rem',
    lineHeight: 1.5,
    minWidth: 0,
    outline: 'none',
  }

  return (
    <div style={containerStyle}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
          {required && <span style={{ color: 'var(--color-coral)', marginLeft: '3px' }}>*</span>}
        </label>
      )}
      <div style={wrapperStyle}>
        {icon && (
          <span style={{ color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }}>{icon}</span>
        )}
        <input
          autoComplete={autoComplete}
          disabled={disabled}
          id={inputId}
          name={name}
          onBlur={() => setFocused(false)}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          required={required}
          style={inputStyle}
          type={inputType}
          value={value}
        />
        {isPassword && (
          <button
            onClick={() => setShowPassword((p) => !p)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: 0,
            }}
            type="button"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        {rightElement && !isPassword && (
          <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{rightElement}</span>
        )}
      </div>
      {error && (
        <p
          style={{
            alignItems: 'center',
            color: 'var(--color-coral)',
            display: 'flex',
            fontSize: '0.8125rem',
            gap: '4px',
          }}
        >
          <AlertCircle size={12} /> {error}
        </p>
      )}
      {hint && !error && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{hint}</p>
      )}
    </div>
  )
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
  const generatedTextareaId = useId()
  const [focused, setFocused] = useState(false)
  const textareaId = generatedTextareaId

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', ...extraStyle }}>
      {label && (
        <label
          htmlFor={textareaId}
          style={{
            color: error ? 'var(--color-coral)' : 'var(--text-secondary)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-coral)', marginLeft: '3px' }}>*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        maxLength={maxLength}
        onBlur={() => setFocused(false)}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        style={{
          background: '#fff',
          border: `2px solid ${error ? 'var(--color-coral)' : focused ? 'var(--color-navy)' : 'var(--border-medium)'}`,
          borderRadius: 'var(--radius-md)',
          boxShadow: focused ? '0 0 0 3px rgba(18, 23, 74, 0.08)' : 'none',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.9375rem',
          lineHeight: 1.6,
          outline: 'none',
          padding: '0.65rem 0.875rem',
          resize: 'vertical',
          transition: 'border-color var(--transition-fast)',
        }}
        value={value}
      />
      {maxLength && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'right' }}>
          {value?.length || 0}/{maxLength}
        </p>
      )}
      {error && <p style={{ color: 'var(--color-coral)', fontSize: '0.8125rem' }}>{error}</p>}
      {hint && !error && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{hint}</p>
      )}
    </div>
  )
}

function Eye({ size = 16 }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={size}
    >
      <title>Show password</title>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOff({ size = 16 }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={size}
    >
      <title>Hide password</title>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" x2="23" y1="1" y2="23" />
    </svg>
  )
}

function AlertCircle({ size = 16 }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={size}
    >
      <title>Validation error</title>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}
