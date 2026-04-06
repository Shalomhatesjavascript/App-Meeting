import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return children
}

export function RequireVerified({ children }) {
  const { isAuthenticated, isVerified, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  if (!isVerified) {
    return <Navigate replace to="/verify-email" />
  }

  return children
}

export function RequireGuest({ children }) {
  const { isAuthenticated, isVerified, isProfileComplete, loading } = useAuth()

  if (loading) return <PageLoader />

  if (isAuthenticated) {
    if (!isVerified) return <Navigate replace to="/verify-email" />
    if (!isProfileComplete) return <Navigate replace to="/setup-profile" />
    return <Navigate replace to="/app/discover" />
  }

  return children
}

function PageLoader() {
  return (
    <div
      style={{
        alignItems: 'center',
        background: 'var(--surface-elevated)',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            animation: 'spin 0.8s linear infinite',
            border: '3px solid var(--border-light)',
            borderRadius: '50%',
            borderTopColor: 'var(--color-navy)',
            height: 48,
            width: 48,
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</p>
      </div>
    </div>
  )
}
