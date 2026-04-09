import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { clearStoredSession, getCurrentUser, logoutUser, updateStoredUser } from '../api/auth'
import { authClient } from '../lib/auth-client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const bootstrap = async () => {
      const stored = getCurrentUser()
      const session = await authClient.getSession()
      const hasSession = Boolean(session?.data?.session)

      if (!mounted) return

      if (!hasSession) {
        clearStoredSession()
        setUser(null)
      } else {
        setUser(stored)
      }

      setLoading(false)
    }

    bootstrap()

    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback((userData) => {
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    await logoutUser()
    setUser(null)
  }, [])

  const updateUser = useCallback((updates) => {
    const updated = updateStoredUser(updates)
    if (updated) setUser(updated)
    return updated
  }, [])

  const value = {
    isAuthenticated: !!user,
    isProfileComplete: user?.profileComplete ?? false,
    isVerified: user?.isVerified ?? false,
    loading,
    login,
    logout,
    updateUser,
    user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
