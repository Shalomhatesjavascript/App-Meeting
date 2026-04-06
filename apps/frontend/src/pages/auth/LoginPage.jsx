// ============================================
// Login Page
// ============================================

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { getEmailError, getPasswordError } from '../../utils/validators';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isVerified, isProfileComplete } = useAuth();
  const { showToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    const emailErr = getEmailError(email);
    const passErr = getPasswordError(password);
    if (emailErr) errs.email = emailErr;
    if (passErr) errs.password = passErr;
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const { user } = await loginUser({ email, password });
      login(user);

      const from = location.state?.from?.pathname;

      if (!user.isVerified) {
        navigate('/verify-email', { replace: true });
      } else if (!user.profileComplete) {
        navigate('/setup-profile', { replace: true });
      } else {
        navigate(from || '/app/discover', { replace: true });
      }
    } catch (err) {
      showToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      {/* Left panel — branding */}
      <div style={brandPanelStyle}>
        <BrandContent />
      </div>

      {/* Right panel — form */}
      <div style={formPanelStyle}>
        <div style={formContainerStyle}>
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <div style={logoStyle}>
              <span style={{ fontSize: '1.25rem' }}>🎓</span>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-navy)', lineHeight: 1 }}>
                BU Connect
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1 }}>
                Babcock University
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '2rem', animation: 'fadeSlideUp 0.4s both' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Sign in to your campus account
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeSlideUp 0.4s 0.1s both' }}>
            <Input
              label="University Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="yourname@student.babcock.edu.ng"
              error={errors.email}
              required
              autoComplete="email"
              icon={<EmailIcon />}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              error={errors.password}
              required
              autoComplete="current-password"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <a href="#" style={{ fontSize: '0.875rem', color: 'var(--color-navy)', fontWeight: 500 }}>
                Forgot password?
              </a>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Sign In
            </Button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', animation: 'fadeSlideUp 0.4s 0.2s both' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              New to campus?{' '}
              <Link to="/register" style={{ color: 'var(--color-navy)', fontWeight: 600 }}>
                Create an account
              </Link>
            </p>
          </div>

          {/* Demo hint */}
          <div style={{
            marginTop: '2rem',
            padding: '0.875rem',
            background: 'rgba(18,23,74,0.05)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-medium)',
          }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              💡 <strong>Demo:</strong> Register first, then use any password to log in.
              Use any 6-digit code for email verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandContent() {
  return (
    <div style={{ maxWidth: 420, animation: 'fadeSlideUp 0.5s both' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ ...logoStyle, width: 64, height: 64, fontSize: '2rem', marginBottom: '1.5rem' }}>
          🎓
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 4vw, 2.75rem)',
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1.15,
          marginBottom: '1rem',
        }}>
          Connect with<br />
          <span style={{ color: 'var(--color-amber)' }}>your campus</span>
        </h1>
        <p style={{
          fontSize: '1.0625rem',
          color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.7,
          maxWidth: 360,
        }}>
          Meet Babcock students who share your passions, interests, and ambitions.
          Built for real connections — beyond just faces.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[
          { icon: '🔒', text: 'Verified university emails only' },
          { icon: '💬', text: 'Connect through personality, not just looks' },
          { icon: '✨', text: 'Find friends, study buddies, or more' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
            animation: `fadeSlideUp 0.4s ${0.2 + i * 0.1}s both`,
          }}>
            <span style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              flexShrink: 0,
            }}>
              {item.icon}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9375rem' }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Styles ----
const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  background: 'var(--surface-elevated)',
};

const brandPanelStyle = {
  display: 'none',
  flex: '0 0 480px',
  background: 'var(--color-navy)',
  backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(232,160,32,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(224,107,90,0.1) 0%, transparent 50%)',
  padding: '3rem',
  alignItems: 'center',
  justifyContent: 'center',
  '@media (min-width: 768px)': { display: 'flex' },
};

const formPanelStyle = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 1.5rem',
  overflowY: 'auto',
};

const formContainerStyle = {
  width: '100%',
  maxWidth: '420px',
};

const logoStyle = {
  width: 48,
  height: 48,
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-navy)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

function EmailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
