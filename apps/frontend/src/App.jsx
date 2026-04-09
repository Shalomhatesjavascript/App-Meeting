import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MatchModal } from './components/MatchModal'
import { RequireGuest, RequireVerified } from './components/RouteGuards'
import { Toast } from './components/ui/Toast'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import DiscoverPage from './pages/app/DiscoverPage'
import MatchesPage from './pages/app/MatchesPage'
import MessagesPage from './pages/app/MessagesPage'
import ProfilePage from './pages/app/ProfilePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import SetupProfilePage from './pages/onboarding/SetupProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <div className="app-shell">
            <Routes>
              <Route element={<Navigate replace to="/login" />} path="/" />

              <Route
                element={
                  <RequireGuest>
                    <LoginPage />
                  </RequireGuest>
                }
                path="/login"
              />
              <Route
                element={
                  <RequireGuest>
                    <RegisterPage />
                  </RequireGuest>
                }
                path="/register"
              />

              <Route element={<Navigate replace to="/setup-profile" />} path="/verify-email" />

              <Route
                element={
                  <RequireVerified>
                    <SetupProfilePage />
                  </RequireVerified>
                }
                path="/setup-profile"
              />

              <Route path="/app">
                <Route element={<Navigate replace to="/app/discover" />} index />
                <Route
                  element={
                    <RequireVerified>
                      <DiscoverPage />
                    </RequireVerified>
                  }
                  path="discover"
                />
                <Route
                  element={
                    <RequireVerified>
                      <MatchesPage />
                    </RequireVerified>
                  }
                  path="matches"
                />
                <Route
                  element={
                    <RequireVerified>
                      <MessagesPage />
                    </RequireVerified>
                  }
                  path="messages"
                />
                <Route
                  element={
                    <RequireVerified>
                      <MessagesPage />
                    </RequireVerified>
                  }
                  path="messages/:matchId"
                />
                <Route
                  element={
                    <RequireVerified>
                      <ProfilePage />
                    </RequireVerified>
                  }
                  path="profile"
                />
              </Route>

              <Route element={<Navigate replace to="/login" />} path="*" />
            </Routes>

            <Toast />
            <MatchModal />
          </div>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
