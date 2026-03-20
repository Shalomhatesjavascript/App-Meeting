// ============================================
// Bottom Navigation Bar
// ============================================

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  {
    to: '/app/discover',
    label: 'Discover',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--color-navy)' : 'none'} stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    to: '/app/matches',
    label: 'Matches',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--color-coral)' : 'none'} stroke={active ? 'var(--color-coral)' : 'currentColor'} strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    to: '/app/messages',
    label: 'Messages',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--color-navy)' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    to: '/app/profile',
    label: 'Profile',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--color-navy)' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function BottomNav({ unreadCount = 0 }) {
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#fff',
      borderTop: '1px solid var(--border-light)',
      display: 'flex',
      alignItems: 'stretch',
      height: '64px',
      zIndex: 'var(--z-nav)',
      boxShadow: '0 -4px 20px rgba(18, 23, 74, 0.06)',
    }}>
      {NAV_ITEMS.map(item => {
        const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
        const showBadge = item.label === 'Messages' && unreadCount > 0;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              textDecoration: 'none',
              color: isActive ? 'var(--color-navy)' : 'var(--text-muted)',
              transition: 'color var(--transition-fast)',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative' }}>
              {item.icon(isActive)}
              {showBadge && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: 'var(--color-coral)',
                  color: '#fff',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: isActive ? 600 : 400,
              letterSpacing: '0.01em',
            }}>
              {item.label}
            </span>
            {isActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 32,
                height: 3,
                background: 'var(--color-navy)',
                borderRadius: '0 0 4px 4px',
              }} />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
