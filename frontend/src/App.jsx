// ============================================
// App.jsx — Root component with routing
// ============================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

// Route guards
import { RequireAuth, RequireVerified, RequireGuest } from './components/RouteGuards';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// Onboarding
import SetupProfilePage from './pages/onboarding/SetupProfilePage';

// App pages
import DiscoverPage from './pages/app/DiscoverPage';
import MatchesPage from './pages/app/MatchesPage';
import MessagesPage from './pages/app/MessagesPage';
import ProfilePage from './pages/app/ProfilePage';

// Global UI
import { Toast } from './components/ui/Toast';
import { MatchModal } from './components/MatchModal';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <div className="app-shell">
            <Routes>
              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Auth routes — redirect if already logged in */}
              <Route
                path="/login"
                element={
                  <RequireGuest>
                    <LoginPage />
                  </RequireGuest>
                }
              />
              <Route
                path="/register"
                element={
                  <RequireGuest>
                    <RegisterPage />
                  </RequireGuest>
                }
              />

              {/* Verification — requires auth but not verified */}
              <Route
                path="/verify-email"
                element={
                  <RequireAuth>
                    <VerifyEmailPage />
                  </RequireAuth>
                }
              />

              {/* Profile setup — requires verified */}
              <Route
                path="/setup-profile"
                element={
                  <RequireVerified>
                    <SetupProfilePage />
                  </RequireVerified>
                }
              />

              {/* Main app routes — requires verified */}
              <Route path="/app">
                <Route index element={<Navigate to="/app/discover" replace />} />
                <Route
                  path="discover"
                  element={
                    <RequireVerified>
                      <DiscoverPage />
                    </RequireVerified>
                  }
                />
                <Route
                  path="matches"
                  element={
                    <RequireVerified>
                      <MatchesPage />
                    </RequireVerified>
                  }
                />
                <Route
                  path="messages"
                  element={
                    <RequireVerified>
                      <MessagesPage />
                    </RequireVerified>
                  }
                />
                <Route
                  path="messages/:matchId"
                  element={
                    <RequireVerified>
                      <MessagesPage />
                    </RequireVerified>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <RequireVerified>
                      <ProfilePage />
                    </RequireVerified>
                  }
                />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>

            {/* Global overlays */}
            <Toast />
            <MatchModal />
          </div>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
