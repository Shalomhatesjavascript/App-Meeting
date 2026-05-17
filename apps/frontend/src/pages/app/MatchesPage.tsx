// ============================================
// Matches Page
// ============================================

import type { CSSProperties } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../components/Avatar'
import { BottomNav } from '../../components/BottomNav'
import { useApp } from '../../context/AppContext'
import { useMatchesQuery } from '../../hooks/useMatches'
import type { MatchCard } from '../../types'

export default function MatchesPage() {
  const navigate = useNavigate()
  const { showToast } = useApp()
  const matchesQuery = useMatchesQuery()
  const matches: MatchCard[] = matchesQuery.data || []
  const loading = matchesQuery.isLoading

  useEffect(() => {
    if (matchesQuery.isError) {
      showToast({ message: 'Failed to load matches', type: 'error' })
    }
  }, [matchesQuery.isError, showToast])

  const handleOpenChat = (match: MatchCard) => {
    navigate(`/app/messages/${match.id}`)
  }

  return (
    <div style={pageStyle}>
      <header style={{ padding: '1.25rem 1.5rem 1rem' }}>
        <h1
          style={{
            color: 'var(--color-navy)',
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 600,
          }}
        >
          Matches
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '2px' }}>
          {matches.length} connection{matches.length !== 1 ? 's' : ''}
        </p>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
        {loading ? (
          <LoadingSkeleton />
        ) : matches.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              paddingBottom: '1rem',
            }}
          >
            <div style={{ marginBottom: '0.5rem' }}>
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  marginBottom: '0.875rem',
                  textTransform: 'uppercase',
                }}
              >
                Recent Matches
              </p>
              <div
                style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}
              >
                {matches.map((match) => (
                  <button
                    key={`${match.id}-mini`}
                    onClick={() => handleOpenChat(match)}
                    style={{
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      flexShrink: 0,
                      gap: '0.375rem',
                    }}
                    type="button"
                  >
                    <div style={{ position: 'relative' }}>
                      <Avatar
                        seed={match.user?.avatarSeed}
                        showRing={match.unread > 0}
                        size={60}
                        style={match.user?.avatarStyle}
                      />
                      {match.unread > 0 && (
                        <div
                          style={{
                            alignItems: 'center',
                            background: 'var(--color-coral)',
                            border: '2px solid var(--surface-elevated)',
                            borderRadius: '50%',
                            color: '#fff',
                            display: 'flex',
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            height: 18,
                            justifyContent: 'center',
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            width: 18,
                          }}
                        >
                          {match.unread}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        maxWidth: 60,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {match.user?.name?.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
              }}
            >
              Conversations
            </p>
            {matches.map((match) => (
              <button
                key={match.id}
                onClick={() => handleOpenChat(match)}
                style={{
                  alignItems: 'center',
                  background: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '0.875rem',
                  padding: '0.875rem',
                  textAlign: 'left',
                  width: '100%',
                }}
                type="button"
              >
                <Avatar
                  seed={match.user?.avatarSeed}
                  showRing={match.unread > 0}
                  size={52}
                  style={match.user?.avatarStyle}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <p
                      style={{
                        color: 'var(--text-primary)',
                        fontSize: '0.9375rem',
                        fontWeight: match.unread > 0 ? 700 : 500,
                      }}
                    >
                      {match.user?.name}
                    </p>
                    <span
                      style={{ color: 'var(--text-muted)', flexShrink: 0, fontSize: '0.75rem' }}
                    >
                      {formatTime(match.lastMessageAt || match.matchedAt)}
                    </span>
                  </div>
                  <p
                    style={{
                      color: match.unread > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontSize: '0.875rem',
                      fontWeight: match.unread > 0 ? 500 : 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {match.lastMessage || `Matched · Say hi to ${match.user?.name?.split(' ')[0]}!`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav unreadCount={matches.reduce((acc, match) => acc + (match.unread || 0), 0)} />
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
      <span style={{ display: 'block', fontSize: '3.5rem', marginBottom: '1rem' }}>💫</span>
      <h3
        style={{
          color: 'var(--color-navy)',
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          marginBottom: '0.5rem',
        }}
      >
        No matches yet
      </h3>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        Start discovering profiles and make your first connection!
      </p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          style={{
            alignItems: 'center',
            background: '#fff',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            gap: '0.875rem',
            padding: '0.875rem',
          }}
        >
          <div
            style={{
              animation: 'pulse 1.5s ease-in-out infinite',
              background: 'var(--border-light)',
              borderRadius: '50%',
              height: 52,
              width: 52,
            }}
          />
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '0.5rem' }}>
            <div
              style={{
                animation: 'pulse 1.5s ease-in-out infinite',
                background: 'var(--border-light)',
                borderRadius: 4,
                height: 14,
                width: '60%',
              }}
            />
            <div
              style={{
                animation: 'pulse 1.5s ease-in-out infinite',
                background: 'var(--border-light)',
                borderRadius: 4,
                height: 12,
                width: '80%',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function formatTime(isoString?: string) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const day = 86400000
  if (diff < day) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diff < 7 * day) return date.toLocaleDateString([], { weekday: 'short' })
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' })
}

const pageStyle: CSSProperties = {
  background: 'var(--surface-elevated)',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  paddingBottom: '64px',
}
