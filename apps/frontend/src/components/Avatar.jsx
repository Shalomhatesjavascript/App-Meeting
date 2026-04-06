import { getAvatarUrl } from '../utils/mockData'

export function Avatar({
  style = 'notionists',
  seed = 'default',
  size = 48,
  borderColor,
  showRing = false,
  className = '',
}) {
  const url = getAvatarUrl(style, seed)

  const containerStyle = {
    alignItems: 'center',
    background: 'var(--color-cream-dark)',
    border: showRing
      ? `3px solid ${borderColor || 'var(--color-amber)'}`
      : borderColor
        ? `2px solid ${borderColor}`
        : '2px solid var(--border-light)',
    borderRadius: '50%',
    boxShadow: showRing ? '0 0 0 2px #fff' : 'none',
    display: 'flex',
    flexShrink: 0,
    height: size,
    justifyContent: 'center',
    overflow: 'hidden',
    width: size,
  }

  return (
    <div className={className} style={containerStyle}>
      <img
        alt="User avatar"
        height={size}
        loading="lazy"
        src={url}
        style={{ height: '100%', objectFit: 'cover', width: '100%' }}
        width={size}
      />
    </div>
  )
}

export function AvatarWithFallback({ name, style, seed, size = 48, ...props }) {
  if (!style || !seed) {
    const initials = name
      ? name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : '?'

    return (
      <div
        style={{
          alignItems: 'center',
          background: 'var(--color-navy)',
          borderRadius: '50%',
          color: 'var(--text-inverse)',
          display: 'flex',
          flexShrink: 0,
          fontFamily: 'var(--font-display)',
          fontSize: size * 0.35,
          fontWeight: 600,
          height: size,
          justifyContent: 'center',
          width: size,
          ...props.style,
        }}
      >
        {initials}
      </div>
    )
  }

  return <Avatar seed={seed} size={size} style={style} {...props} />
}
