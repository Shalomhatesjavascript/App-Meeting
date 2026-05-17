import type { ProfileSelectDB } from '@repo/backend'
import { useState } from 'react'
import { AVATAR_SEEDS, AVATAR_STYLES, getAvatarUrl } from '../shared/catalog'
import type { AvatarChoice } from '../types'
import { Button } from './ui/Button'

type AvatarPickerProps = Readonly<{
  onSelect: (choice: AvatarChoice) => void
  selected?: Partial<AvatarChoice>
}>

export function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  const [activeStyle, setActiveStyle] = useState(selected?.avatarStyle || 'notionists')
  const [activeSeed, setActiveSeed] = useState(selected?.avatarSeed || 'felix')

  const handleStyleChange = (style: ProfileSelectDB['avatarStyle']) => {
    setActiveStyle(style)
    onSelect({ avatarSeed: activeSeed, avatarStyle: style })
  }

  const handleSeedChange = (seed: string) => {
    setActiveSeed(seed)
    onSelect({ avatarSeed: seed, avatarStyle: activeStyle })
  }

  const handleRandomize = () => {
    const styleEntry = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)]
    const randomStyle = styleEntry?.id ?? 'notionists'
    const randomSeed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)] || 'felix'
    setActiveStyle(randomStyle)
    setActiveSeed(randomSeed)
    onSelect({ avatarSeed: randomSeed, avatarStyle: randomStyle })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            background: 'var(--color-cream-dark)',
            border: '4px solid var(--color-amber)',
            borderRadius: '50%',
            boxShadow: '0 0 0 4px rgba(232, 160, 32, 0.15), var(--shadow-md)',
            flexShrink: 0,
            height: 120,
            overflow: 'hidden',
            width: 120,
          }}
        >
          <img
            alt="Selected avatar preview"
            src={getAvatarUrl(activeStyle, activeSeed)}
            style={{ height: '100%', objectFit: 'cover', width: '100%' }}
          />
        </div>
        <Button icon={<ShuffleIcon />} onClick={handleRandomize} size="sm" variant="secondary">
          Randomize
        </Button>
      </div>

      <div>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            letterSpacing: '0.06em',
            marginBottom: '0.625rem',
            textTransform: 'uppercase',
          }}
        >
          Avatar Style
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {AVATAR_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => handleStyleChange(s.id)}
              style={{
                alignItems: 'center',
                background: activeStyle === s.id ? 'var(--color-navy)' : '#fff',
                border: `2px solid ${activeStyle === s.id ? 'var(--color-navy)' : 'var(--border-medium)'}`,
                borderRadius: 'var(--radius-full)',
                color: activeStyle === s.id ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                fontSize: '0.8125rem',
                fontWeight: 500,
                gap: '4px',
                padding: '0.4rem 0.875rem',
                transition: 'all var(--transition-fast)',
              }}
              type="button"
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            letterSpacing: '0.06em',
            marginBottom: '0.625rem',
            textTransform: 'uppercase',
          }}
        >
          Choose a Character
        </p>
        <div
          style={{
            display: 'grid',
            gap: '0.5rem',
            gridTemplateColumns: 'repeat(6, 1fr)',
          }}
        >
          {AVATAR_SEEDS.map((seed) => (
            <button
              key={seed}
              onClick={() => handleSeedChange(seed)}
              style={{
                aspectRatio: '1',
                background: 'var(--color-cream-dark)',
                border: `3px solid ${activeSeed === seed ? 'var(--color-amber)' : 'transparent'}`,
                borderRadius: '50%',
                boxShadow: activeSeed === seed ? '0 0 0 2px rgba(232,160,32,0.3)' : 'none',
                cursor: 'pointer',
                overflow: 'hidden',
                padding: 0,
                transform: activeSeed === seed ? 'scale(1.1)' : 'scale(1)',
                transition: 'all var(--transition-fast)',
                width: '100%',
              }}
              title={seed}
              type="button"
            >
              <img
                alt={seed}
                loading="lazy"
                src={getAvatarUrl(activeStyle, seed)}
                style={{ display: 'block', height: '100%', objectFit: 'cover', width: '100%' }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ShuffleIcon() {
  return (
    <svg
      fill="none"
      height="14"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="14"
    >
      <title>Shuffle avatars</title>
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" x2="21" y1="20" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" x2="21" y1="15" y2="21" />
    </svg>
  )
}
