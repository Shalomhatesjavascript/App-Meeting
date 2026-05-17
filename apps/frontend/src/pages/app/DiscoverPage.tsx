// ============================================
// Discover Page — Swipe-based discovery
// ============================================

import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { BottomNav } from '../../components/BottomNav'
import { IntentBadge, VerifiedBadge } from '../../components/ui/Badge'
import { useApp } from '../../context/AppContext'
import { useDiscoveryCandidatesQuery, useSwipeUserMutation } from '../../hooks/useDiscovery'
import { useUserQuery } from '../../hooks/useUser'

export default function DiscoverPage() {
  const { showMatch, showToast } = useApp()
  const discoveryQuery = useDiscoveryCandidatesQuery()
  const swipeMutation = useSwipeUserMutation()
  const viewerQuery = useUserQuery()

  const users = discoveryQuery.data || []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swiping, setSwiping] = useState<'left' | 'right' | null>(null)
  const [expanded, setExpanded] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (discoveryQuery.isError) {
      showToast({ message: 'Failed to load profiles', type: 'error' })
    }
  }, [discoveryQuery.isError, showToast])

  useEffect(() => {
    if (currentIndex >= users.length) {
      setCurrentIndex(0)
    }
  }, [currentIndex, users.length])

  const currentUser = users[currentIndex]
  const viewerUserId = viewerQuery.data?.id
  const bio = currentUser?.bio ?? ''

  const handleSwipe = async (action: 'like' | 'pass') => {
    if (!currentUser || !viewerUserId || swiping) return
    setSwiping(action === 'like' ? 'right' : 'left')

    try {
      const result = await swipeMutation.mutateAsync({
        fromUserId: viewerUserId,
        isLike: action === 'like',
        toUserId: currentUser.id,
      })
      setTimeout(async () => {
        setSwiping(null)
        setExpanded(false)
        setCurrentIndex((i) => i + 1)
        if (result?.match) {
          showMatch({
            avatarSeed: currentUser.avatarSeed,
            avatarStyle: currentUser.avatarStyle,
            bio: currentUser.bio ?? undefined,
            department: currentUser.department,
            id: currentUser.id,
            intent: currentUser.intent,
            isVerified: currentUser.isVerified,
            level: currentUser.level,
            name: currentUser.name,
          })
        }
      }, 350)
    } catch {
      setSwiping(null)
      showToast({ message: 'Failed to process swipe', type: 'error' })
    }
  }

  const loading = discoveryQuery.isLoading || discoveryQuery.isFetching

  if (loading) {
    return (
      <div style={pageStyle}>
        <PageHeader />
        <div style={{ alignItems: 'center', display: 'flex', flex: 1, justifyContent: 'center' }}>
          <div
            style={{
              animation: 'spin 0.8s linear infinite',
              border: '3px solid var(--border-light)',
              borderRadius: '50%',
              borderTopColor: 'var(--color-navy)',
              height: 40,
              width: 40,
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!currentUser || currentIndex >= users.length) {
    return (
      <div style={pageStyle}>
        <PageHeader />
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🌟</span>
          <h2
            style={{
              color: 'var(--color-navy)',
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              marginBottom: '0.75rem',
            }}
          >
            You've seen everyone!
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 280 }}>
            New profiles are added regularly. Check back soon or revisit your matches.
          </p>
          <button
            onClick={async () => {
              await discoveryQuery.refetch()
              setCurrentIndex(0)
            }}
            style={{
              background: 'transparent',
              border: '2px solid var(--color-navy)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-navy)',
              cursor: 'pointer',
              fontWeight: 600,
              marginTop: '1.5rem',
              padding: '0.625rem 1.5rem',
            }}
            type="button"
          >
            Refresh
          </button>
        </div>
        <BottomNav />
      </div>
    )
  }

  const cardStyle: CSSProperties = {
    background: '#fff',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-xl)',
    maxWidth: '420px',
    opacity: swiping ? 0 : 1,
    overflow: 'hidden',
    position: 'relative',
    transform:
      swiping === 'right'
        ? 'translateX(120%) rotate(15deg)'
        : swiping === 'left'
          ? 'translateX(-120%) rotate(-15deg)'
          : 'none',
    transition: swiping ? 'transform 0.35s ease, opacity 0.35s ease' : 'none',
    userSelect: 'none',
    width: '100%',
  }

  return (
    <div style={pageStyle}>
      <PageHeader />

      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          gap: '1rem',
          overflowY: 'auto',
          padding: '1rem 1rem 1.5rem',
        }}
      >
        {/* Queue indicator */}
        {users.length > currentIndex + 1 && (
          <div
            style={{
              height: 12,
              marginBottom: -12,
              maxWidth: '420px',
              position: 'relative',
              width: '100%',
            }}
          >
            <div
              style={{
                background: 'rgba(255,255,255,0.6)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)',
                inset: 0,
                position: 'absolute',
                transform: 'scale(0.96) translateY(8px)',
              }}
            />
          </div>
        )}

        {/* Profile card */}
        <div ref={cardRef} style={cardStyle}>
          {/* Avatar section */}
          <div
            style={{
              alignItems: 'center',
              background: 'linear-gradient(135deg, var(--color-cream-dark) 0%, #e8e0f0 100%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              padding: '2.5rem 2rem',
              position: 'relative',
            }}
          >
            {/* Swipe indicator overlays */}
            {swiping === 'right' && <div style={swipeLabelStyle('#4ade80', 'left')}>💛 Like</div>}
            {swiping === 'left' && <div style={swipeLabelStyle('#f87171', 'right')}>✕ Pass</div>}

            <Avatar
              borderColor="rgba(255,255,255,0.9)"
              seed={currentUser.avatarSeed}
              showRing
              size={120}
              style={currentUser.avatarStyle}
            />

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  gap: '0.5rem',
                  justifyContent: 'center',
                  marginBottom: '0.25rem',
                }}
              >
                <h2
                  style={{
                    color: 'var(--color-navy)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.625rem',
                    fontWeight: 600,
                  }}
                >
                  {currentUser.name}
                </h2>
                {currentUser.isVerified && <VerifiedBadge />}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {currentUser.department} · {currentUser.level}L
              </p>
            </div>

            <IntentBadge intent={currentUser.intent} />
          </div>

          {/* Bio & details */}
          <div style={{ padding: '1.5rem' }}>
            {/* Bio — key focus area */}
            <div style={{ marginBottom: '1.25rem' }}>
              <p
                style={{
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontStyle: 'italic',
                  lineHeight: 1.75,
                }}
              >
                "{expanded ? bio : bio.slice(0, 160)}
                {!expanded && bio.length > 160 && <span>...</span>}"
              </p>
              {bio.length > 160 && (
                <button
                  onClick={() => setExpanded((e) => !e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-navy)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginTop: '0.25rem',
                    padding: 0,
                  }}
                  type="button"
                >
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

            {/* Interests */}
            <div style={{ marginBottom: '0.25rem' }}>
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  marginBottom: '0.625rem',
                  textTransform: 'uppercase',
                }}
              >
                Interests
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {(currentUser.interestNames || []).map((interest) => (
                  <span
                    key={interest}
                    style={{
                      background: 'var(--color-cream-dark)',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      padding: '0.25rem 0.75rem',
                    }}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: '1.25rem',
            justifyContent: 'center',
            maxWidth: '420px',
            padding: '0.5rem 0',
            width: '100%',
          }}
        >
          {/* Pass button */}
          <button
            aria-label="Pass profile"
            disabled={!!swiping}
            onClick={() => handleSwipe('pass')}
            style={actionButtonStyle('#fff', 'var(--shadow-md)')}
            type="button"
          >
            <svg
              fill="none"
              height="24"
              stroke="var(--color-coral)"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              width="24"
            >
              <title>Pass</title>
              <line x1="18" x2="6" y1="6" y2="18" />
              <line x1="6" x2="18" y1="6" y2="18" />
            </svg>
          </button>

          {/* Super like */}
          <button
            aria-label="Super like"
            onClick={() => showToast({ message: 'Super Like — coming in premium!', type: 'info' })}
            style={{ ...actionButtonStyle('#fff', 'var(--shadow-sm)'), height: 48, width: 48 }}
            type="button"
          >
            <svg
              fill="var(--color-amber)"
              height="20"
              stroke="var(--color-amber)"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="20"
            >
              <title>Super like</title>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>

          {/* Like button */}
          <button
            aria-label="Like profile"
            disabled={!!swiping}
            onClick={() => handleSwipe('like')}
            style={actionButtonStyle('var(--color-navy)', 'var(--shadow-md)')}
            type="button"
          >
            <svg
              fill="#fff"
              height="24"
              stroke="#fff"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
            >
              <title>Like</title>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {users.slice(0, Math.min(users.length, 6)).map((user, i) => (
            <div
              key={user.id}
              style={{
                background: i === currentIndex ? 'var(--color-navy)' : 'var(--border-medium)',
                borderRadius: 3,
                height: 6,
                transition: 'all var(--transition-base)',
                width: i === currentIndex ? 20 : 6,
              }}
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function PageHeader() {
  return (
    <header
      style={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '1.25rem 1.5rem 0.5rem',
      }}
    >
      <div>
        <h1
          style={{
            color: 'var(--color-navy)',
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          Discover
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '2px' }}>
          Babcock University
        </p>
      </div>
      <button
        aria-label="Open filters"
        style={{
          alignItems: 'center',
          background: '#fff',
          border: '2px solid var(--border-light)',
          borderRadius: '50%',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          display: 'flex',
          height: 40,
          justifyContent: 'center',
          width: 40,
        }}
        type="button"
      >
        <svg
          fill="none"
          height="18"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="18"
        >
          <title>Filters</title>
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="8" x2="20" y1="12" y2="12" />
          <line x1="12" x2="20" y1="18" y2="18" />
        </svg>
      </button>
    </header>
  )
}

const pageStyle: CSSProperties = {
  background: 'var(--surface-elevated)',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  paddingBottom: '64px',
}

const actionButtonStyle = (bg: string, shadow: string): CSSProperties => ({
  alignItems: 'center',
  background: bg,
  border: 'none',
  borderRadius: '50%',
  boxShadow: shadow,
  cursor: 'pointer',
  display: 'flex',
  flexShrink: 0,
  height: 64,
  justifyContent: 'center',
  transition: 'transform var(--transition-spring), box-shadow var(--transition-fast)',
  width: 64,
})

const swipeLabelStyle = (color: string, side: 'left' | 'right'): CSSProperties => ({
  position: 'absolute',
  top: '1.5rem',
  [side]: '1.5rem',
  background: color,
  borderRadius: 'var(--radius-full)',
  color: '#fff',
  fontSize: '0.875rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  opacity: 0.95,
  padding: '0.375rem 0.875rem',
  zIndex: 10,
})
