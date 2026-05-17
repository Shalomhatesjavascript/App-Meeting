import type { CSSProperties, ReactNode } from 'react'

export type BadgeColor = 'amber' | 'coral' | 'green' | 'lavender' | 'navy'

export type BadgeProps = Readonly<{
  children: ReactNode
  color?: BadgeColor
  emoji?: ReactNode
  style?: CSSProperties
}>

export function Badge({ children, color = 'navy', emoji, style: extraStyle = {} }: BadgeProps) {
  const bgMap = {
    amber: 'rgba(232, 160, 32, 0.15)',
    coral: 'rgba(224, 107, 90, 0.12)',
    green: 'rgba(90, 138, 114, 0.12)',
    lavender: 'rgba(123, 111, 160, 0.12)',
    navy: 'rgba(18, 23, 74, 0.08)',
  }
  const textMap = {
    amber: '#b87a10',
    coral: 'var(--color-coral)',
    green: 'var(--color-sage)',
    lavender: 'var(--color-lavender)',
    navy: 'var(--color-navy)',
  }

  const bg = bgMap[color]
  const text = textMap[color]

  return (
    <span
      style={{
        alignItems: 'center',
        background: bg,
        borderRadius: 'var(--radius-full)',
        color: text,
        display: 'inline-flex',
        fontSize: '0.75rem',
        fontWeight: 600,
        gap: '4px',
        letterSpacing: '0.02em',
        padding: '0.25rem 0.625rem',
        userSelect: 'none',
        ...extraStyle,
      }}
    >
      {emoji && <span>{emoji}</span>}
      {children}
    </span>
  )
}

export function IntentBadge({ intent }: Readonly<{ intent?: string }>) {
  const map: Record<string, { color: BadgeColor; emoji: string; label: string }> = {
    dating: { color: 'amber', emoji: '💛', label: 'Dating' },
    friendship: { color: 'green', emoji: '🤝', label: 'Friendship' },
    networking: { color: 'navy', emoji: '🌐', label: 'Networking' },
    'study buddy': { color: 'lavender', emoji: '📚', label: 'Study Buddy' },
    study_buddy: { color: 'lavender', emoji: '📚', label: 'Study Buddy' },
    studying: { color: 'lavender', emoji: '📚', label: 'Study Buddy' },
  }
  const config = map[(intent ?? '').toLowerCase()] || map.friendship
  return (
    <Badge color={config.color} emoji={config.emoji}>
      {config.label}
    </Badge>
  )
}

export function VerifiedBadge() {
  return (
    <span
      style={{
        alignItems: 'center',
        background: 'rgba(18, 23, 74, 0.08)',
        borderRadius: 'var(--radius-full)',
        color: 'var(--color-navy)',
        display: 'inline-flex',
        fontSize: '0.7rem',
        fontWeight: 700,
        gap: '3px',
        letterSpacing: '0.04em',
        padding: '0.2rem 0.5rem',
      }}
    >
      <CheckCircle size={10} />
      VERIFIED
    </span>
  )
}

function CheckCircle({ size = 12 }: Readonly<{ size?: number }>) {
  return (
    <svg
      fill="none"
      height={size}
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      width={size}
    >
      <title>Verified</title>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
