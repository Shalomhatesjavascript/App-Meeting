// ============================================
// Matches Page
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMatches } from '../../api/matches';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../../components/Avatar';
import { IntentBadge } from '../../components/ui/Badge';
import { BottomNav } from '../../components/BottomNav';

export default function MatchesPage() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const data = await getMatches();
      setMatches(data);
    } catch {
      showToast({ message: 'Failed to load matches', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (match) => {
    navigate(`/app/messages/${match.id}`);
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <header style={{ padding: '1.25rem 1.5rem 1rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)' }}>
          Matches
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          {matches.length} connection{matches.length !== 1 ? 's' : ''}
        </p>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
        {loading ? (
          <LoadingSkeleton />
        ) : matches.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '1rem' }}>
            {/* New matches row */}
            <div style={{ marginBottom: '0.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
                Recent Matches
              </p>
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {matches.map(match => (
                  <button
                    key={match.id + '-mini'}
                    onClick={() => handleOpenChat(match)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.375rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <Avatar
                        style={match.user?.avatarStyle}
                        seed={match.user?.avatarSeed}
                        size={60}
                        showRing={match.unread > 0}
                      />
                      {match.unread > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: 'var(--color-coral)',
                          border: '2px solid var(--surface-elevated)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          color: '#fff',
                        }}>
                          {match.unread}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {match.user?.name?.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation list */}
            <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Conversations
            </p>
            {matches.map(match => (
              <button
                key={match.id}
                onClick={() => handleOpenChat(match)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  padding: '0.875rem',
                  background: '#fff',
                  borderRadius: 'var(--radius-lg)',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform var(--transition-fast)',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
                <Avatar
                  style={match.user?.avatarStyle}
                  seed={match.user?.avatarSeed}
                  size={52}
                  showRing={match.unread > 0}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <p style={{ fontWeight: match.unread > 0 ? 700 : 500, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                      {match.user?.name}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                      {formatTime(match.lastMessageAt || match.matchedAt)}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: match.unread > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: match.unread > 0 ? 500 : 400,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {match.lastMessage || `Matched · Say hi to ${match.user?.name?.split(' ')[0]}!`}
                  </p>
                </div>
                {match.unread > 0 && (
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'var(--color-coral)',
                    color: '#fff',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {match.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav unreadCount={matches.reduce((acc, m) => acc + (m.unread || 0), 0)} />
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>💫</span>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--color-navy)', marginBottom: '0.5rem' }}>
        No matches yet
      </h3>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        Start discovering profiles and make your first connection!
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          padding: '0.875rem',
          background: '#fff',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--border-light)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ width: '60%', height: 14, background: 'var(--border-light)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ width: '80%', height: 12, background: 'var(--border-light)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diff = now - date;
  const day = 86400000;
  if (diff < day) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 7 * day) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--surface-elevated)',
  paddingBottom: '64px',
};
