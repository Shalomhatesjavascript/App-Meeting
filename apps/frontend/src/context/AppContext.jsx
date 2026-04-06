import { createContext, useCallback, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [toast, setToast] = useState(null)
  const [matchModal, setMatchModal] = useState(null)

  const showToast = useCallback(({ message, type = 'info', duration = 3000 }) => {
    setToast({ id: Date.now(), message, type })
    setTimeout(() => setToast(null), duration)
  }, [])

  const showMatch = useCallback((user) => {
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
