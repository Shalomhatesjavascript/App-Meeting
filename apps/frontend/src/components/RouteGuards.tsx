import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUserQuery } from '../hooks/useUser'
import { useProfileQuery } from '../hooks/useProfile'

export function RequireVerified({ children }: Readonly<{ children: ReactNode }>) {
  const userQuery = useUserQuery()
  const location = useLocation()
  const isLoading = userQuery.isLoading || userQuery.isPending
  const isAuthenticated = !userQuery.error && userQuery.data

  if (isLoading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return children
}

export function RequireGuest({ children }: Readonly<{ children: ReactNode }>) {
  const userQuery = useUserQuery()
  const { data: profile } = useProfileQuery()
  const isLoading = userQuery.isLoading || userQuery.isPending
  const isAuthenticated = !userQuery.error && userQuery.data

  if (isLoading) return <PageLoader />

  if (isAuthenticated) {
    if (!profile?.isIdVerified) return <Navigate replace to="/setup-profile" />
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
