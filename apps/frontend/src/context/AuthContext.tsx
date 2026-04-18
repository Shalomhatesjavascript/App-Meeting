import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { clearStoredSession, getCurrentUser, logoutUser, updateStoredUser } from '../api/auth'
import { authClient } from '../lib/auth-client'
import type { SessionUser } from '../types'

type AuthContextValue = Readonly<{
  isAuthenticated: boolean
  isProfileComplete: boolean
  isVerified: boolean
  loading: boolean
  login: (userData: SessionUser) => void
  logout: () => Promise<void>
  updateUser: (updates: Partial<SessionUser>) => SessionUser | null
  user: SessionUser | null
}>

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<SessionUser | null>(null)
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

  const login = useCallback((userData: SessionUser) => {
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    await logoutUser()
    setUser(null)
  }, [])

  const updateUser = useCallback((updates: Partial<SessionUser>) => {
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
