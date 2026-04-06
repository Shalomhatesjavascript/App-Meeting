// ============================================
// Register Page
// ============================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { getEmailError, getPasswordError, isValidName } from '../../utils/validators';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useApp();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const setField = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!isValidName(form.name)) errs.name = 'Please enter your full name';
    const emailErr = getEmailError(form.email);
    if (emailErr) errs.email = emailErr;
    const passErr = getPasswordError(form.password);
    if (passErr) errs.password = passErr;
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      const { user } = await registerUser({ name: form.name, email: form.email, password: form.password });
      login(user);
      showToast({ message: 'Account created! Check your email.', type: 'success' });
      navigate('/verify-email', { state: { email: form.email }, replace: true });
    } catch (err) {
      showToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(form.password);

  return (
    <div style={pageStyle}>
      {/* Brand panel */}
      <div style={brandPanelStyle}>
        <div style={{ maxWidth: 400, animation: 'fadeSlideUp 0.5s both' }}>
          <div style={{ marginBottom: '2rem' }}>
            <span style={{ fontSize: '3rem' }}>🎓</span>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.2,
            marginBottom: '1rem',
          }}>
            Join the<br />
            <span style={{ color: 'var(--color-amber)' }}>BU community</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
            Your campus, your connections. Discover classmates who match your energy — verified Babcock students only.
          </p>

          <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)', backdropFilter: 'blur(8px)' }}>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>
              "I found my study group through BU Connect. Game changer for finals week."
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem', marginTop: '0.5rem' }}>— Amara O., CS 300L</p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div style={formPanelStyle}>
        <div style={formContainerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={logoMiniStyle}>🎓</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-navy)' }}>
              BU Connect
            </span>
          </div>

          <div style={{ marginBottom: '2rem', animation: 'fadeSlideUp 0.4s both' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.875rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.375rem' }}>
              Create your account
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Babcock students only — university email required
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem', animation: 'fadeSlideUp 0.4s 0.1s both' }}>
            <Input
              label="Full Name"
              type="text"
              value={form.name}
              onChange={setField('name')}
              placeholder="Amara Okafor"
              error={errors.name}
              required
              autoComplete="name"
            />

            <Input
              label="University Email"
              type="email"
              value={form.email}
              onChange={setField('email')}
              placeholder="yourname@student.babcock.edu.ng"
              error={errors.email}
              hint="Must be your official Babcock student email"
              required
              autoComplete="email"
              icon={<EmailIcon />}
            />

            <div>
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={setField('password')}
                placeholder="At least 8 characters"
                error={errors.password}
                required
                autoComplete="new-password"
              />
              {form.password.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1,
                        height: 3,
                        borderRadius: 2,
                        background: i <= passwordStrength.score
                          ? passwordStrength.color
                          : 'var(--border-medium)',
                        transition: 'background var(--transition-fast)',
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: passwordStrength.color }}>{passwordStrength.label}</p>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={setField('confirmPassword')}
              placeholder="Repeat password"
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              By creating an account you agree to our{' '}
              <a href="#" style={{ color: 'var(--color-navy)', fontWeight: 500 }}>Terms of Service</a>
              {' '}and{' '}
              <a href="#" style={{ color: 'var(--color-navy)', fontWeight: 500 }}>Privacy Policy</a>.
            </p>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Create Account
            </Button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: 'var(--color-navy)', fontWeight: 600 }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;

  const map = [
    { score: 1, label: 'Weak', color: 'var(--color-coral)' },
    { score: 2, label: 'Fair', color: 'var(--color-amber)' },
    { score: 3, label: 'Good', color: 'var(--color-sage)' },
    { score: 4, label: 'Strong', color: 'var(--color-sage)' },
  ];
  return map[score - 1] || { score: 1, label: 'Weak', color: 'var(--color-coral)' };
}

const pageStyle = { minHeight: '100vh', display: 'flex', background: 'var(--surface-elevated)' };
const brandPanelStyle = {
  display: 'none',
  flex: '0 0 420px',
  background: 'var(--color-navy)',
  backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(232,160,32,0.15) 0%, transparent 50%)',
  padding: '3rem',
  alignItems: 'center',
  justifyContent: 'center',
};
const formPanelStyle = { flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2.5rem 1.5rem', overflowY: 'auto' };
const formContainerStyle = { width: '100%', maxWidth: '420px', paddingTop: '1rem', paddingBottom: '3rem' };
const logoMiniStyle = { width: 36, height: 36, borderRadius: 8, background: 'var(--color-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' };

function EmailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
