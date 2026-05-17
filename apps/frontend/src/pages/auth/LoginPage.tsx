// ============================================
// Login Page
// ============================================

import { BabcockEmailSchema } from '@repo/shared'
import type { CSSProperties, FormEvent } from 'react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import * as v from 'valibot'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useApp } from '../../context/AppContext'
import { useSendSignInCodeMutation } from '../../hooks/useAuthMutations'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useApp()
  const sendSignInCodeMutation = useSendSignInCodeMutation()

  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): Record<string, string> => {
    const result = v.safeParse(BabcockEmailSchema, email)
    if (result.success) return {}

    return { email: result.issues[0]?.message || 'Enter a valid university email' }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})

    try {
      await sendSignInCodeMutation.mutateAsync({ email })
      showToast({ message: 'We sent a sign-in code to your email.', type: 'success' })
      navigate('/verify-email', {
        replace: true,
        state: {
          email,
          from: location.state?.from?.pathname || '/app/discover',
          type: 'sign-in',
        },
      })
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : 'Failed to send sign-in code',
        type: 'error',
      })
    }
  }

  const loading = sendSignInCodeMutation.isPending

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
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '2.5rem',
            }}
          >
            <div style={logoStyle}>
              <span style={{ fontSize: '1.25rem' }}>🎓</span>
            </div>
            <div>
              <p
                style={{
                  color: 'var(--color-navy)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  lineHeight: 1,
                }}
              >
                BU Connect
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1 }}>
                Babcock University
              </p>
            </div>
          </div>

          <div style={{ animation: 'fadeSlideUp 0.4s both', marginBottom: '2rem' }}>
            <h1
              style={{
                color: 'var(--color-navy)',
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
              }}
            >
              Welcome back
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Sign in to your campus account
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              animation: 'fadeSlideUp 0.4s 0.1s both',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <Input
              autoComplete="email"
              error={errors.email}
              icon={<EmailIcon />}
              label="University Email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@student.babcock.edu.ng"
              required
              type="email"
              value={email}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <a
                href="/register"
                style={{ color: 'var(--color-navy)', fontSize: '0.875rem', fontWeight: 500 }}
              >
                Need an account?
              </a>
            </div>

            <Button fullWidth loading={loading} size="lg" type="submit" variant="primary">
              Send sign-in code
            </Button>
          </form>

          <div
            style={{
              animation: 'fadeSlideUp 0.4s 0.2s both',
              marginTop: '1.5rem',
              textAlign: 'center',
            }}
          >
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              New to campus?{' '}
              <Link style={{ color: 'var(--color-navy)', fontWeight: 600 }} to="/register">
                Create an account
              </Link>
            </p>
          </div>

          {/* Demo hint */}
          <div
            style={{
              background: 'rgba(18,23,74,0.05)',
              border: '1px dashed var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              marginTop: '2rem',
              padding: '0.875rem',
            }}
          >
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textAlign: 'center' }}>
              💡 <strong>Sign in:</strong> We’ll email you a 6-digit code to finish login.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function BrandContent() {
  return (
    <div style={{ animation: 'fadeSlideUp 0.5s both', maxWidth: 420 }}>
      <div style={{ marginBottom: '2rem' }}>
        <div
          style={{ ...logoStyle, fontSize: '2rem', height: 64, marginBottom: '1.5rem', width: 64 }}
        >
          🎓
        </div>
        <h1
          style={{
            color: '#fff',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: '1rem',
          }}
        >
          Connect with
          <br />
          <span style={{ color: 'var(--color-amber)' }}>your campus</span>
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '1.0625rem',
            lineHeight: 1.7,
            maxWidth: 360,
          }}
        >
          Meet Babcock students who share your passions, interests, and ambitions. Built for real
          connections — beyond just faces.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[
          { icon: '🔒', text: 'Verified university emails only' },
          { icon: '💬', text: 'Connect through personality, not just looks' },
          { icon: '✨', text: 'Find friends, study buddies, or more' },
        ].map((item, i) => (
          <div
            key={item.text}
            style={{
              alignItems: 'center',
              animation: `fadeSlideUp 0.4s ${0.2 + i * 0.1}s both`,
              display: 'flex',
              gap: '0.875rem',
            }}
          >
            <span
              style={{
                alignItems: 'center',
                background: 'rgba(255,255,255,0.12)',
                borderRadius: '50%',
                display: 'flex',
                flexShrink: 0,
                fontSize: '1rem',
                height: 36,
                justifyContent: 'center',
                width: 36,
              }}
            >
              {item.icon}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9375rem' }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Styles ----
const pageStyle: CSSProperties = {
  background: 'var(--surface-elevated)',
  display: 'flex',
  minHeight: '100vh',
}

const brandPanelStyle: CSSProperties = {
  alignItems: 'center',
  background: 'var(--color-navy)',
  backgroundImage:
    'radial-gradient(circle at 20% 80%, rgba(232,160,32,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(224,107,90,0.1) 0%, transparent 50%)',
  display: 'none',
  flex: '0 0 480px',
  justifyContent: 'center',
  padding: '3rem',
}

const formPanelStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  overflowY: 'auto',
  padding: '2rem 1.5rem',
}

const formContainerStyle: CSSProperties = {
  maxWidth: '420px',
  width: '100%',
}

const logoStyle: CSSProperties = {
  alignItems: 'center',
  background: 'var(--color-navy)',
  borderRadius: 'var(--radius-md)',
  display: 'flex',
  flexShrink: 0,
  height: 48,
  justifyContent: 'center',
  width: 48,
}

function EmailIcon() {
  return (
    <svg
      fill="none"
      height="16"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="16"
    >
      <title>Email</title>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}
