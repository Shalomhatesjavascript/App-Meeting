// ============================================
// Badge Component
// ============================================

import React from 'react';

export function Badge({ children, color, emoji, style: extraStyle = {} }) {
  const bgMap = {
    green: 'rgba(90, 138, 114, 0.12)',
    amber: 'rgba(232, 160, 32, 0.15)',
    coral: 'rgba(224, 107, 90, 0.12)',
    navy: 'rgba(18, 23, 74, 0.08)',
    lavender: 'rgba(123, 111, 160, 0.12)',
  };
  const textMap = {
    green: 'var(--color-sage)',
    amber: '#b87a10',
    coral: 'var(--color-coral)',
    navy: 'var(--color-navy)',
    lavender: 'var(--color-lavender)',
  };

  const bg = bgMap[color] || bgMap.navy;
  const text = textMap[color] || textMap.navy;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '0.25rem 0.625rem',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
      background: bg,
      color: text,
      userSelect: 'none',
      ...extraStyle,
    }}>
      {emoji && <span>{emoji}</span>}
      {children}
    </span>
  );
}

export function IntentBadge({ intent }) {
  const map = {
    friendship: { label: 'Friendship', emoji: '🤝', color: 'green' },
    dating: { label: 'Dating', emoji: '💛', color: 'amber' },
    networking: { label: 'Networking', emoji: '🌐', color: 'navy' },
    study_buddy: { label: 'Study Buddy', emoji: '📚', color: 'lavender' },
  };
  const config = map[intent] || map.friendship;
  return (
    <Badge emoji={config.emoji} color={config.color}>
      {config.label}
    </Badge>
  );
}

export function VerifiedBadge() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '3px',
      padding: '0.2rem 0.5rem',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.7rem',
      fontWeight: 700,
      background: 'rgba(18, 23, 74, 0.08)',
      color: 'var(--color-navy)',
      letterSpacing: '0.04em',
    }}>
      <CheckCircle size={10} />
      VERIFIED
    </span>
  );
}

function CheckCircle({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
