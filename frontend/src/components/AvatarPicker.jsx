// ============================================
// AvatarPicker Component
// Allows users to pick a style and seed
// ============================================

import React, { useState } from 'react';
import { AVATAR_STYLES, AVATAR_SEEDS, getAvatarUrl } from '../utils/mockData';
import { Button } from './ui/Button';

export function AvatarPicker({ selected, onSelect }) {
  const [activeStyle, setActiveStyle] = useState(selected?.style || 'notionists');
  const [activeSeed, setActiveSeed] = useState(selected?.seed || 'felix');

  const handleStyleChange = (style) => {
    setActiveStyle(style);
    onSelect({ style, seed: activeSeed });
  };

  const handleSeedChange = (seed) => {
    setActiveSeed(seed);
    onSelect({ style: activeStyle, seed });
  };

  const handleRandomize = () => {
    const randomStyle = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)].id;
    const randomSeed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)];
    setActiveStyle(randomStyle);
    setActiveSeed(randomSeed);
    onSelect({ style: randomStyle, seed: randomSeed });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Preview */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '4px solid var(--color-amber)',
          boxShadow: '0 0 0 4px rgba(232, 160, 32, 0.15), var(--shadow-md)',
          background: 'var(--color-cream-dark)',
          flexShrink: 0,
        }}>
          <img
            src={getAvatarUrl(activeStyle, activeSeed)}
            alt="Selected avatar preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <Button variant="secondary" size="sm" onClick={handleRandomize} icon={<ShuffleIcon />}>
          Randomize
        </Button>
      </div>

      {/* Style selector */}
      <div>
        <p style={{
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '0.625rem',
        }}>
          Avatar Style
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {AVATAR_STYLES.map(s => (
            <button
              key={s.id}
              onClick={() => handleStyleChange(s.id)}
              style={{
                padding: '0.4rem 0.875rem',
                borderRadius: 'var(--radius-full)',
                border: `2px solid ${activeStyle === s.id ? 'var(--color-navy)' : 'var(--border-medium)'}`,
                background: activeStyle === s.id ? 'var(--color-navy)' : '#fff',
                color: activeStyle === s.id ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Seed grid */}
      <div>
        <p style={{
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '0.625rem',
        }}>
          Choose a Character
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '0.5rem',
        }}>
          {AVATAR_SEEDS.map(seed => (
            <button
              key={seed}
              onClick={() => handleSeedChange(seed)}
              title={seed}
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: '50%',
                overflow: 'hidden',
                border: `3px solid ${activeSeed === seed ? 'var(--color-amber)' : 'transparent'}`,
                padding: 0,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                transform: activeSeed === seed ? 'scale(1.1)' : 'scale(1)',
                boxShadow: activeSeed === seed ? '0 0 0 2px rgba(232,160,32,0.3)' : 'none',
                background: 'var(--color-cream-dark)',
              }}
            >
              <img
                src={getAvatarUrl(activeStyle, seed)}
                alt={seed}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShuffleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
    </svg>
  );
}
