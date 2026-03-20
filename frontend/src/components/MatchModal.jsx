// ============================================
// Match Modal — Shown after a mutual match
// ============================================

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Avatar } from './Avatar';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';

export function MatchModal() {
  const { matchModal, dismissMatch } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (matchModal) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [matchModal]);

  if (!matchModal) return null;

  const { user: matchedUser } = matchModal;

  const handleMessage = () => {
    dismissMatch();
    navigate('/app/messages');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--color-navy)',
      zIndex: 'var(--z-modal)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      animation: 'fadeIn 0.4s both',
      backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(232,160,32,0.15) 0%, transparent 60%), radial-gradient(circle at 70% 70%, rgba(224,107,90,0.1) 0%, transparent 60%)',
    }}>
      {/* Stars */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.6)',
            animation: `pulse ${1 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }} />
        ))}
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', animation: 'fadeSlideUp 0.5s 0.1s both' }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--color-amber)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '0.5rem',
        }}>
          It's a match!
        </p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.5rem',
          fontWeight: 600,
          color: '#fff',
          lineHeight: 1.1,
        }}>
          You connected ✨
        </h2>
      </div>

      {/* Avatars */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        marginBottom: '2rem',
        animation: 'matchPop 0.6s 0.3s both',
      }}>
        {/* Current user avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <Avatar
            style={user?.profile?.avatarStyle || 'notionists'}
            seed={user?.profile?.avatarSeed || 'default'}
            size={96}
            showRing
            borderColor="var(--color-amber)"
          />
          <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            {user?.name?.split(' ')[0] || 'You'}
          </span>
        </div>

        {/* Heart */}
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--color-coral)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'heartBeat 1s 0.8s ease-in-out',
          flexShrink: 0,
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>

        {/* Matched user avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <Avatar
            style={matchedUser?.avatarStyle || 'adventurer'}
            seed={matchedUser?.avatarSeed || 'felix'}
            size={96}
            showRing
            borderColor="var(--color-coral)"
          />
          <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            {matchedUser?.name?.split(' ')[0] || 'Match'}
          </span>
        </div>
      </div>

      {/* Bio preview */}
      <div style={{
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
        maxWidth: '320px',
        width: '100%',
        marginBottom: '2rem',
        animation: 'fadeSlideUp 0.5s 0.5s both',
        backdropFilter: 'blur(8px)',
      }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.9375rem',
          color: 'rgba(255,255,255,0.85)',
          fontStyle: 'italic',
          lineHeight: 1.6,
          textAlign: 'center',
        }}>
          "{matchedUser?.bio?.slice(0, 100)}..."
        </p>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        width: '100%',
        maxWidth: '280px',
        animation: 'fadeSlideUp 0.5s 0.7s both',
      }}>
        <Button variant="amber" size="lg" fullWidth onClick={handleMessage}>
          Send a message
        </Button>
        <Button
          variant="ghost"
          size="lg"
          fullWidth
          onClick={dismissMatch}
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          Keep swiping
        </Button>
      </div>
    </div>
  );
}
