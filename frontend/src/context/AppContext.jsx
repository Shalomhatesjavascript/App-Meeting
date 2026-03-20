// ============================================
// App Context — Global UI State
// ============================================

import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [matchModal, setMatchModal] = useState(null); // { user }

  const showToast = useCallback(({ message, type = 'info', duration = 3000 }) => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), duration);
  }, []);

  const showMatch = useCallback((user) => {
    setMatchModal({ user });
  }, []);

  const dismissMatch = useCallback(() => {
    setMatchModal(null);
  }, []);

  return (
    <AppContext.Provider value={{ toast, showToast, matchModal, showMatch, dismissMatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
