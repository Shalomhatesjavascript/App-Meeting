import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useState } from 'react'
import type { MatchCard, ToastState, ToastType } from '../types'

type MatchModalState = Readonly<{ user: MatchCard['user'] }>

type AppContextValue = Readonly<{
  dismissMatch: () => void
  matchModal: MatchModalState | null
  showMatch: (user: MatchCard['user']) => void
  showToast: (input: Readonly<{ duration?: number; message: string; type?: ToastType }>) => void
  toast: ToastState | null
}>

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const [matchModal, setMatchModal] = useState<MatchModalState | null>(null)

  const showToast = useCallback(
    ({
      message,
      type = 'info',
      duration = 3000,
    }: Readonly<{ duration?: number; message: string; type?: ToastType }>) => {
      setToast({ id: Date.now(), message, type })
      setTimeout(() => setToast(null), duration)
    },
    [],
  )

  const showMatch = useCallback((user: MatchCard['user']) => {
    setMatchModal({ user })
  }, [])

  const dismissMatch = useCallback(() => {
    setMatchModal(null)
  }, [])

  return (
    <AppContext.Provider value={{ dismissMatch, matchModal, showMatch, showToast, toast }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
