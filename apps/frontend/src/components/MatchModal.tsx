import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Avatar } from './Avatar'
import { Button } from './ui/Button'
import { useUserQuery } from '../hooks/useUser'

export function MatchModal() {
  const { matchModal, dismissMatch } = useApp()
  const { data: userData } = useUserQuery()
  const navigate = useNavigate()
  const sparkleKeys = Array.from({ length: 20 }, (_, index) => `sparkle-${index}`)

  useEffect(() => {
    if (matchModal) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [matchModal])

  if (!matchModal) return null

  const { user: matchedUser } = matchModal

  const handleMessage = () => {
    dismissMatch()
    navigate('/app/messages')
  }

  return (
    <div
      style={{
        alignItems: 'center',
        animation: 'fadeIn 0.4s both',
        background: 'var(--color-navy)',
        backgroundImage:
          'radial-gradient(circle at 30% 30%, rgba(232,160,32,0.15) 0%, transparent 60%), radial-gradient(circle at 70% 70%, rgba(224,107,90,0.1) 0%, transparent 60%)',
        display: 'flex',
        flexDirection: 'column',
        inset: 0,
        justifyContent: 'center',
        padding: '2rem',
        position: 'fixed',
        zIndex: 'var(--z-modal)',
      }}
    >
      <div style={{ inset: 0, overflow: 'hidden', pointerEvents: 'none', position: 'absolute' }}>
        {sparkleKeys.map((sparkleKey) => (
          <div
            key={sparkleKey}
            style={{
              animation: `pulse ${1 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              background: 'rgba(255,255,255,0.6)',
              borderRadius: '50%',
              height: Math.random() * 4 + 2,
              left: `${Math.random() * 100}%`,
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              width: Math.random() * 4 + 2,
            }}
          />
        ))}
      </div>

      <div
        style={{
          animation: 'fadeSlideUp 0.5s 0.1s both',
          marginBottom: '2rem',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            color: 'var(--color-amber)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            fontWeight: 500,
            letterSpacing: '0.12em',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
          }}
        >
          It's a match!
        </p>
        <h2
          style={{
            color: '#fff',
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 600,
            lineHeight: 1.1,
          }}
        >
          You connected ✨
        </h2>
      </div>

      <div
        style={{
          alignItems: 'center',
          animation: 'matchPop 0.6s 0.3s both',
          display: 'flex',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <Avatar
            borderColor="var(--color-amber)"
            seed={userData?.profile?.avatarSeed || 'default'}
            showRing
            size={96}
            style={userData?.profile?.avatarStyle || 'notionists'}
          />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8125rem', fontWeight: 500 }}>
            {userData?.name?.split(' ')[0] || 'You'}
          </span>
        </div>

        <div
          style={{
            alignItems: 'center',
            animation: 'heartBeat 1s 0.8s ease-in-out',
            background: 'var(--color-coral)',
            borderRadius: '50%',
            display: 'flex',
            flexShrink: 0,
            height: 48,
            justifyContent: 'center',
            width: 48,
          }}
        >
          <svg fill="#fff" height="24" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24" width="24">
            <title>Match</title>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>

        <div
          style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <Avatar
            borderColor="var(--color-coral)"
            seed={matchedUser?.avatarSeed || 'felix'}
            showRing
            size={96}
            style={matchedUser?.avatarStyle || 'adventurer'}
          />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8125rem', fontWeight: 500 }}>
            {matchedUser?.name?.split(' ')[0] || 'Match'}
          </span>
        </div>
      </div>

      <div
        style={{
          animation: 'fadeSlideUp 0.5s 0.5s both',
          backdropFilter: 'blur(8px)',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem',
          maxWidth: '320px',
          padding: '1rem 1.25rem',
          width: '100%',
        }}
      >
        <p
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontFamily: 'var(--font-display)',
            fontSize: '0.9375rem',
            fontStyle: 'italic',
            lineHeight: 1.6,
            textAlign: 'center',
          }}
        >
          "{matchedUser?.bio?.slice(0, 100)}..."
        </p>
      </div>

      <div
        style={{
          animation: 'fadeSlideUp 0.5s 0.7s both',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '280px',
          width: '100%',
        }}
      >
        <Button fullWidth onClick={handleMessage} size="lg" variant="amber">
          Send a message
        </Button>
        <Button
          fullWidth
          onClick={dismissMatch}
          size="lg"
          style={{ color: 'rgba(255,255,255,0.6)' }}
          variant="ghost"
        >
          Keep swiping
        </Button>
      </div>
    </div>
  )
}
