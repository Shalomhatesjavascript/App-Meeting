// ============================================
// Route Guards
// ============================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Redirects unauthenticated users to /login
 */
export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Redirects unverified users to /verify-email
 */
export function RequireVerified({ children }) {
  const { isAuthenticated, isVerified, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
}

/**
 * Redirects authenticated users away from auth pages
 */
export function RequireGuest({ children }) {
  const { isAuthenticated, isVerified, isProfileComplete, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (isAuthenticated) {
    if (!isVerified) return <Navigate to="/verify-email" replace />;
    if (!isProfileComplete) return <Navigate to="/setup-profile" replace />;
    return <Navigate to="/app/discover" replace />;
  }

  return children;
}

function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-elevated)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '3px solid var(--border-light)',
          borderTopColor: 'var(--color-navy)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</p>
      </div>
    </div>
  );
}
