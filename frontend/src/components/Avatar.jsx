// ============================================
// Avatar Component
// Renders DiceBear avatars via URL
// ============================================

import React from 'react';
import { getAvatarUrl } from '../utils/mockData';

export function Avatar({
  style = 'notionists',
  seed = 'default',
  size = 48,
  borderColor,
  showRing = false,
  className = '',
}) {
  const url = getAvatarUrl(style, seed);

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    background: 'var(--color-cream-dark)',
    border: showRing
      ? `3px solid ${borderColor || 'var(--color-amber)'}`
      : borderColor
      ? `2px solid ${borderColor}`
      : '2px solid var(--border-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: showRing ? '0 0 0 2px #fff' : 'none',
  };

  return (
    <div style={containerStyle} className={className}>
      <img
        src={url}
        alt="User avatar"
        width={size}
        height={size}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        loading="lazy"
      />
    </div>
  );
}

/**
 * AvatarWithFallback — shows initials if image fails
 */
export function AvatarWithFallback({ name, style, seed, size = 48, ...props }) {
  const [failed, setFailed] = React.useState(false);
  const url = getAvatarUrl(style, seed);

  if (failed || !style || !seed) {
    const initials = name
      ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
      : '?';

    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--color-navy)',
        color: 'var(--text-inverse)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: size * 0.35,
        flexShrink: 0,
        ...props.style,
      }}>
        {initials}
      </div>
    );
  }

  return (
    <Avatar
      style={style}
      seed={seed}
      size={size}
      {...props}
    />
  );
}
