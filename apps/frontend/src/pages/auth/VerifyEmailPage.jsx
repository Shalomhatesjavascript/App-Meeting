// ============================================
// Email Verification Page
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyEmail, resendVerificationEmail } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();
  const { showToast } = useApp();

  const email = user?.email || location.state?.email || '';
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');

  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const val = value.slice(-1);
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);
    setError('');

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (val && index === 5) {
      const fullCode = [...newCode.slice(0, 5), val].join('');
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newCode = pasted.split('').concat(['', '', '', '', '', '']).slice(0, 6);
      setCode(newCode);
      const lastFilled = Math.min(pasted.length, 5);
      inputRefs.current[lastFilled]?.focus();
      if (pasted.length === 6) handleVerify(pasted);
    }
  };

  const handleVerify = async (fullCode) => {
    const codeStr = fullCode || code.join('');
    if (codeStr.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { user: updatedUser } = await verifyEmail({ email, code: codeStr });
      updateUser({ isVerified: true });
      showToast({ message: 'Email verified! 🎉', type: 'success' });
      navigate('/setup-profile', { replace: true });
    } catch (err) {
      setError(err.message);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResending(true);
    try {
      await resendVerificationEmail({ email });
      showToast({ message: 'Verification code resent!', type: 'success' });
      setResendCooldown(60);
    } catch {
      showToast({ message: 'Failed to resend. Try again.', type: 'error' });
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-elevated)',
      padding: '2rem 1.5rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        animation: 'fadeSlideUp 0.4s both',
      }}>
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'var(--color-navy)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            fontSize: '2rem',
          }}>
            ✉️
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.875rem',
            fontWeight: 600,
            color: 'var(--color-navy)',
            marginBottom: '0.625rem',
          }}>
            Check your inbox
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            We sent a 6-digit verification code to
          </p>
          <p style={{ fontWeight: 600, color: 'var(--color-navy)', wordBreak: 'break-all' }}>
            {email}
          </p>
        </div>

        {/* Code inputs */}
        <div style={{
          background: '#fff',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '1.5rem',
        }}>
          <p style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '1rem',
            textAlign: 'center',
          }}>
            Enter verification code
          </p>

          <div style={{
            display: 'flex',
            gap: '0.625rem',
            justifyContent: 'center',
            marginBottom: '1.25rem',
          }}
            onPaste={handlePaste}
          >
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleCodeChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                style={{
                  width: '3rem',
                  height: '3.5rem',
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  border: `2px solid ${error ? 'var(--color-coral)' : digit ? 'var(--color-navy)' : 'var(--border-medium)'}`,
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  background: digit ? 'rgba(18,23,74,0.04)' : '#fff',
                  color: 'var(--color-navy)',
                  transition: 'all var(--transition-fast)',
                  caretColor: 'transparent',
                }}
              />
            ))}
          </div>

          {error && (
            <p style={{ color: 'var(--color-coral)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1rem' }}>
              {error}
            </p>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            onClick={() => handleVerify()}
            disabled={code.join('').length !== 6}
          >
            Verify Email
          </Button>
        </div>

        {/* Demo hint */}
        <div style={{
          padding: '0.875rem',
          background: 'rgba(232,160,32,0.1)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(232,160,32,0.3)',
          textAlign: 'center',
          marginBottom: '1.5rem',
        }}>
          <p style={{ fontSize: '0.8125rem', color: '#8a6010' }}>
            💡 <strong>Demo mode:</strong> Enter any 6-digit code to continue.
            Try <strong>123456</strong>
          </p>
        </div>

        {/* Resend */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Didn't receive it?{' '}
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || resending}
              style={{
                background: 'none',
                border: 'none',
                color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--color-navy)',
                fontWeight: 600,
                cursor: resendCooldown > 0 ? 'default' : 'pointer',
                fontSize: '0.9375rem',
                fontFamily: 'var(--font-body)',
              }}
            >
              {resending ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
