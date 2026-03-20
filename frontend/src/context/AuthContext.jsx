// ============================================
// Auth Context — BU Connect
// ============================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, logoutUser, updateStoredUser } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate user from localStorage on mount
  useEffect(() => {
    const stored = getCurrentUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    const updated = updateStoredUser(updates);
    if (updated) setUser(updated);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isVerified: user?.isVerified ?? false,
    isProfileComplete: user?.profileComplete ?? false,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
