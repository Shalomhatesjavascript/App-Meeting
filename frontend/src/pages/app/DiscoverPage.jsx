// ============================================
// Discover Page — Swipe-based discovery
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { getDiscoverUsers, swipeUser } from '../../api/matches';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../../components/Avatar';
import { IntentBadge, VerifiedBadge } from '../../components/ui/Badge';
import { BottomNav } from '../../components/BottomNav';

export default function DiscoverPage() {
  const { showMatch, showToast } = useApp();
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(null); // 'left' | 'right'
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getDiscoverUsers();
      setUsers(data);
    } catch {
      showToast({ message: 'Failed to load profiles', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const currentUser = users[currentIndex];

  const handleSwipe = async (action) => {
    if (!currentUser || swiping) return;
    setSwiping(action === 'like' ? 'right' : 'left');

    try {
      const result = await swipeUser({ userId: currentUser.id, action });
      setTimeout(async () => {
        setSwiping(null);
        setExpanded(false);
        setCurrentIndex(i => i + 1);
        if (result.matched) {
          showMatch(currentUser);
        }
      }, 350);
    } catch {
      setSwiping(null);
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <PageHeader />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid var(--border-light)',
            borderTopColor: 'var(--color-navy)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!currentUser || currentIndex >= users.length) {
    return (
      <div style={pageStyle}>
        <PageHeader />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
          <span style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🌟</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--color-navy)', marginBottom: '0.75rem' }}>
            You've seen everyone!
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 280 }}>
            New profiles are added regularly. Check back soon or revisit your matches.
          </p>
          <button
            onClick={loadUsers}
            style={{
              marginTop: '1.5rem',
              padding: '0.625rem 1.5rem',
              borderRadius: 'var(--radius-full)',
              border: '2px solid var(--color-navy)',
              background: 'transparent',
              color: 'var(--color-navy)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const cardStyle = {
    background: '#fff',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-xl)',
    overflow: 'hidden',
    width: '100%',
    maxWidth: '420px',
    position: 'relative',
    transition: swiping ? 'transform 0.35s ease, opacity 0.35s ease' : 'none',
    transform: swiping === 'right'
      ? 'translateX(120%) rotate(15deg)'
      : swiping === 'left'
      ? 'translateX(-120%) rotate(-15deg)'
      : 'none',
    opacity: swiping ? 0 : 1,
    userSelect: 'none',
  };

  return (
    <div style={pageStyle}>
      <PageHeader />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem 1rem 1.5rem',
        overflowY: 'auto',
        gap: '1rem',
      }}>
        {/* Queue indicator */}
        {users.length > currentIndex + 1 && (
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '420px',
            height: 12,
            marginBottom: -12,
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.6)',
              borderRadius: 'var(--radius-xl)',
              transform: 'scale(0.96) translateY(8px)',
              boxShadow: 'var(--shadow-md)',
            }} />
          </div>
        )}

        {/* Profile card */}
        <div ref={cardRef} style={cardStyle}>
          {/* Avatar section */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-cream-dark) 0%, #e8e0f0 100%)',
            padding: '2.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            position: 'relative',
          }}>
            {/* Swipe indicator overlays */}
            {swiping === 'right' && (
              <div style={swipeLabelStyle('#4ade80', 'left')}>💛 Like</div>
            )}
            {swiping === 'left' && (
              <div style={swipeLabelStyle('#f87171', 'right')}>✕ Pass</div>
            )}

            <Avatar
              style={currentUser.avatarStyle}
              seed={currentUser.avatarSeed}
              size={120}
              showRing
              borderColor="rgba(255,255,255,0.9)"
            />

            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.625rem', fontWeight: 600, color: 'var(--color-navy)' }}>
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
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                lineHeight: 1.75,
                color: 'var(--text-primary)',
                fontStyle: 'italic',
              }}>
                "{expanded ? currentUser.bio : currentUser.bio.slice(0, 160)}{!expanded && currentUser.bio.length > 160 && (
                  <span>...</span>
                )}"
              </p>
              {currentUser.bio.length > 160 && (
                <button
                  onClick={() => setExpanded(e => !e)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-navy)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.25rem', padding: 0 }}
                >
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

            {/* Interests */}
            <div style={{ marginBottom: '0.25rem' }}>
              <p style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                marginBottom: '0.625rem',
              }}>
                Interests
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {currentUser.interests.map(interest => (
                  <span key={interest} style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-cream-dark)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                  }}>
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: '1.25rem',
          alignItems: 'center',
          width: '100%',
          maxWidth: '420px',
          justifyContent: 'center',
          padding: '0.5rem 0',
        }}>
          {/* Pass button */}
          <button
            onClick={() => handleSwipe('pass')}
            disabled={!!swiping}
            style={actionButtonStyle('#fff', 'var(--color-coral)', 'var(--shadow-md)')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-coral)" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Super like */}
          <button
            onClick={() => showToast({ message: 'Super Like — coming in premium!', type: 'info' })}
            style={{ ...actionButtonStyle('#fff', 'var(--color-amber)', 'var(--shadow-sm)'), width: 48, height: 48 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-amber)" stroke="var(--color-amber)" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>

          {/* Like button */}
          <button
            onClick={() => handleSwipe('like')}
            disabled={!!swiping}
            style={actionButtonStyle('var(--color-navy)', '#fff', 'var(--shadow-md)')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {users.slice(0, Math.min(users.length, 6)).map((_, i) => (
            <div key={i} style={{
              width: i === currentIndex ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: i === currentIndex ? 'var(--color-navy)' : 'var(--border-medium)',
              transition: 'all var(--transition-base)',
            }} />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function PageHeader() {
  return (
    <header style={{
      padding: '1.25rem 1.5rem 0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--color-navy)',
          lineHeight: 1,
        }}>
          Discover
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Babcock University
        </p>
      </div>
      <button style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '2px solid var(--border-light)',
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="20" y2="12" />
          <line x1="12" y1="18" x2="20" y2="18" />
        </svg>
      </button>
    </header>
  );
}

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--surface-elevated)',
  paddingBottom: '64px',
};

const actionButtonStyle = (bg, color, shadow) => ({
  width: 64,
  height: 64,
  borderRadius: '50%',
  background: bg,
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: shadow,
  transition: 'transform var(--transition-spring), box-shadow var(--transition-fast)',
  flexShrink: 0,
});

const swipeLabelStyle = (color, side) => ({
  position: 'absolute',
  top: '1.5rem',
  [side]: '1.5rem',
  background: color,
  color: '#fff',
  padding: '0.375rem 0.875rem',
  borderRadius: 'var(--radius-full)',
  fontSize: '0.875rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  opacity: 0.95,
  zIndex: 10,
});
