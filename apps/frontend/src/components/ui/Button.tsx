import type { CSSProperties, MouseEvent, MouseEventHandler, ReactNode } from 'react'

const variantStyles = {
  amber: {
    background: 'var(--color-amber)',
    border: '2px solid var(--color-amber)',
    color: 'var(--color-navy)',
  },
  danger: {
    background: 'var(--color-coral)',
    border: '2px solid var(--color-coral)',
    color: '#fff',
  },
  ghost: {
    background: 'transparent',
    border: '2px solid transparent',
    color: 'var(--text-secondary)',
  },
  primary: {
    background: 'var(--color-navy)',
    border: '2px solid var(--color-navy)',
    color: 'var(--text-inverse)',
  },
  secondary: {
    background: 'transparent',
    border: '2px solid var(--color-navy)',
    color: 'var(--color-navy)',
  },
} as const

const sizeStyles = {
  lg: { borderRadius: 'var(--radius-md)', fontSize: '1rem', padding: '0.85rem 2rem' },
  md: { borderRadius: 'var(--radius-md)', fontSize: '0.9375rem', padding: '0.65rem 1.5rem' },
  sm: { borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', padding: '0.4rem 1rem' },
  xl: { borderRadius: 'var(--radius-lg)', fontSize: '1.0625rem', padding: '1rem 2.5rem' },
} as const

export type ButtonVariant = keyof typeof variantStyles
export type ButtonSize = keyof typeof sizeStyles

export type ButtonProps = Readonly<{
  children: ReactNode
  className?: string
  disabled?: boolean
  fullWidth?: boolean
  icon?: ReactNode
  loading?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
  size?: ButtonSize
  style?: CSSProperties
  type?: 'button' | 'submit' | 'reset'
  variant?: ButtonVariant
}>

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
}: ButtonProps) {
  const vStyle = variantStyles[variant] || variantStyles.primary
  const sStyle = sizeStyles[size] || sizeStyles.md

  const baseStyle: CSSProperties = {
    alignItems: 'center',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    gap: '0.5rem',
    justifyContent: 'center',
    letterSpacing: '0.01em',
    opacity: disabled ? 0.5 : 1,
    outline: 'none',
    overflow: 'hidden',
    position: 'relative',
    transition: 'all var(--transition-fast)',
    userSelect: 'none',
    width: fullWidth ? '100%' : 'auto',
    ...vStyle,
    ...sStyle,
    ...extraStyle,
  }

  return (
    <button
      className={`btn ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseDown={(e: MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.transform = 'scale(0.98)'
      }}
      onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
        if (!disabled && !loading) {
          e.currentTarget.style.filter = 'brightness(0.92)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.filter = ''
        e.currentTarget.style.transform = ''
      }}
      onMouseUp={(e: MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      style={baseStyle}
      type={type}
    >
      {loading ? (
        <span style={{ alignItems: 'center', display: 'flex', gap: '0.5rem' }}>
          <LoadingSpinner color="currentColor" size={16} />
          {typeof children === 'string' ? 'Loading...' : children}
        </span>
      ) : (
        <>
          {icon && <span style={{ alignItems: 'center', display: 'flex' }}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}

function LoadingSpinner({
  size = 16,
  color = 'currentColor',
}: Readonly<{ color?: string; size?: number }>) {
  return (
    <svg
      fill="none"
      height={size}
      style={{ animation: 'spin 0.8s linear infinite' }}
      viewBox="0 0 24 24"
      width={size}
    >
      <title>Loading</title>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.3" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeLinecap="round" strokeWidth="3" />
    </svg>
  )
}
