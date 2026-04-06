import { NavLink, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  {
    icon: (active) => (
      <svg
        fill={active ? 'var(--color-navy)' : 'none'}
        height="22"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="22"
      >
        <title>Discover</title>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" x2="16.65" y1="21" y2="16.65" />
      </svg>
    ),
    label: 'Discover',
    to: '/app/discover',
  },
  {
    icon: (active) => (
      <svg
        fill={active ? 'var(--color-coral)' : 'none'}
        height="22"
        stroke={active ? 'var(--color-coral)' : 'currentColor'}
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="22"
      >
        <title>Matches</title>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    label: 'Matches',
    to: '/app/matches',
  },
  {
    icon: (active) => (
      <svg
        fill={active ? 'var(--color-navy)' : 'none'}
        height="22"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="22"
      >
        <title>Messages</title>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    label: 'Messages',
    to: '/app/messages',
  },
  {
    icon: (active) => (
      <svg
        fill={active ? 'var(--color-navy)' : 'none'}
        height="22"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="22"
      >
        <title>Profile</title>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    label: 'Profile',
    to: '/app/profile',
  },
]

export function BottomNav({ unreadCount = 0 }) {
  const location = useLocation()

  return (
    <nav
      style={{
        alignItems: 'stretch',
        background: '#fff',
        borderTop: '1px solid var(--border-light)',
        bottom: 0,
        boxShadow: '0 -4px 20px rgba(18, 23, 74, 0.06)',
        display: 'flex',
        height: '64px',
        left: 0,
        position: 'fixed',
        right: 0,
        zIndex: 'var(--z-nav)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
        const showBadge = item.label === 'Messages' && unreadCount > 0

        return (
          <NavLink
            key={item.to}
            style={{
              alignItems: 'center',
              color: isActive ? 'var(--color-navy)' : 'var(--text-muted)',
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              gap: '3px',
              justifyContent: 'center',
              position: 'relative',
              textDecoration: 'none',
              transition: 'color var(--transition-fast)',
            }}
            to={item.to}
          >
            <div style={{ position: 'relative' }}>
              {item.icon(isActive)}
              {showBadge && (
                <span
                  style={{
                    alignItems: 'center',
                    background: 'var(--color-coral)',
                    borderRadius: '50%',
                    color: '#fff',
                    display: 'flex',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    height: 16,
                    justifyContent: 'center',
                    position: 'absolute',
                    right: -4,
                    top: -4,
                    width: 16,
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: isActive ? 600 : 400,
                letterSpacing: '0.01em',
              }}
            >
              {item.label}
            </span>
            {isActive && (
              <div
                style={{
                  background: 'var(--color-navy)',
                  borderRadius: '0 0 4px 4px',
                  height: 3,
                  left: '50%',
                  position: 'absolute',
                  top: 0,
                  transform: 'translateX(-50%)',
                  width: 32,
                }}
              />
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
