import { useApp } from '../../context/AppContext'

export function Toast() {
  const { toast } = useApp()
  if (!toast) return null

  const colors = {
    error: { bg: 'var(--color-coral)', icon: '✕' },
    info: { bg: 'var(--color-navy)', icon: 'ℹ' },
    success: { bg: 'var(--color-sage)', icon: '✓' },
    warning: { bg: 'var(--color-amber)', icon: '!' },
  }

  const config = colors[toast.type] || colors.info

  return (
    <div
      style={{
        animation: 'fadeSlideUp 0.3s both',
        bottom: '5rem',
        left: '50%',
        position: 'fixed',
        transform: 'translateX(-50%)',
        zIndex: 'var(--z-toast)',
      }}
    >
      <div
        style={{
          alignItems: 'center',
          background: config.bg,
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-lg)',
          color: '#fff',
          display: 'flex',
          fontSize: '0.875rem',
          fontWeight: 500,
          gap: '0.625rem',
          maxWidth: '90vw',
          padding: '0.75rem 1.25rem',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            alignItems: 'center',
            background: 'rgba(255,255,255,0.25)',
            borderRadius: '50%',
            display: 'flex',
            flexShrink: 0,
            fontSize: '0.7rem',
            fontWeight: 700,
            height: 20,
            justifyContent: 'center',
            width: 20,
          }}
        >
          {config.icon}
        </span>
        {toast.message}
      </div>
    </div>
  )
}
