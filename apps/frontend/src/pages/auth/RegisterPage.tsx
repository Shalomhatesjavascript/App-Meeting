// ============================================
// Register Page
// ============================================

import { BabcockEmailSchema } from '@repo/shared'
import type { ChangeEvent, CSSProperties, FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as v from 'valibot'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useApp } from '../../context/AppContext'
import { useRegisterUserMutation } from '../../hooks/useAuthMutations'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { showToast } = useApp()
  const registerMutation = useRegisterUserMutation()

  const [form, setForm] = useState({ confirmPassword: '', email: '', name: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const setField =
    (field: 'confirmPassword' | 'email' | 'name' | 'password') =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
    }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (form.name.trim().length < 2) {
      nextErrors.name = 'Enter your full name'
    }

    const emailResult = v.safeParse(BabcockEmailSchema, form.email)
    if (!emailResult.success) {
      nextErrors.email = emailResult.issues[0]?.message || 'Enter a valid university email'
    }

    if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters'
    }

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match'
    }

    return nextErrors
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
      await registerMutation.mutateAsync({
        email: form.email,
        name: form.name,
        password: form.password,
      })
      showToast({ message: 'We sent a verification code to your email.', type: 'success' })
      navigate('/verify-email', {
        replace: true,
        state: {
          email: form.email,
          name: form.name,
          type: 'email-verification',
        },
      })
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : 'Registration failed',
        type: 'error',
      })
    }
  }

  const loading = registerMutation.isPending

  const passwordStrength = getPasswordStrength(form.password)

  return (
    <div style={pageStyle}>
      {/* Brand panel */}
      <div style={brandPanelStyle}>
        <div style={{ animation: 'fadeSlideUp 0.5s both', maxWidth: 400 }}>
          <div style={{ marginBottom: '2rem' }}>
            <span style={{ fontSize: '3rem' }}>🎓</span>
          </div>
          <h2
            style={{
              color: '#fff',
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: '1rem',
            }}
          >
            Join the
            <br />
            <span style={{ color: 'var(--color-amber)' }}>BU community</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem', lineHeight: 1.7 }}>
            Your campus, your connections. Discover classmates who match your energy — verified
            Babcock students only.
          </p>

          <div
            style={{
              backdropFilter: 'blur(8px)',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius-lg)',
              marginTop: '2rem',
              padding: '1.25rem',
            }}
          >
            <p
              style={{
                color: 'rgba(255,255,255,0.9)',
                fontFamily: 'var(--font-display)',
                fontSize: '0.875rem',
                fontStyle: 'italic',
              }}
            >
              "I found my study group through BU Connect. Game changer for finals week."
            </p>
            <p
              style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem', marginTop: '0.5rem' }}
            >
              — Amara O., CS 300L
            </p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div style={formPanelStyle}>
        <div style={formContainerStyle}>
          <div
            style={{ alignItems: 'center', display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}
          >
            <div style={logoMiniStyle}>🎓</div>
            <span
              style={{
                color: 'var(--color-navy)',
                fontFamily: 'var(--font-display)',
                fontSize: '1.125rem',
                fontWeight: 600,
              }}
            >
              BU Connect
            </span>
          </div>

          <div style={{ animation: 'fadeSlideUp 0.4s both', marginBottom: '2rem' }}>
            <h1
              style={{
                color: 'var(--color-navy)',
                fontFamily: 'var(--font-display)',
                fontSize: '1.875rem',
                fontWeight: 600,
                marginBottom: '0.375rem',
              }}
            >
              Create your account
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Babcock students only — university email required
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              animation: 'fadeSlideUp 0.4s 0.1s both',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.125rem',
            }}
          >
            <Input
              autoComplete="name"
              error={errors.name}
              label="Full Name"
              onChange={setField('name')}
              placeholder="Amara Okafor"
              required
              type="text"
              value={form.name}
            />

            <Input
              autoComplete="email"
              error={errors.email}
              hint="Must be your official Babcock student email"
              icon={<EmailIcon />}
              label="University Email"
              onChange={setField('email')}
              placeholder="yourname@student.babcock.edu.ng"
              required
              type="email"
              value={form.email}
            />

            <div>
              <Input
                autoComplete="new-password"
                error={errors.password}
                label="Password"
                onChange={setField('password')}
                placeholder="At least 8 characters"
                required
                type="password"
                value={form.password}
              />
              {form.password.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          background:
                            i <= passwordStrength.score
                              ? passwordStrength.color
                              : 'var(--border-medium)',
                          borderRadius: 2,
                          flex: 1,
                          height: 3,
                          transition: 'background var(--transition-fast)',
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ color: passwordStrength.color, fontSize: '0.75rem' }}>
                    {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            <Input
              autoComplete="new-password"
              error={errors.confirmPassword}
              label="Confirm Password"
              onChange={setField('confirmPassword')}
              placeholder="Repeat password"
              required
              type="password"
              value={form.confirmPassword}
            />

            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', lineHeight: 1.6 }}>
              By creating an account you agree to our{' '}
              <a href="/terms" style={{ color: 'var(--color-navy)', fontWeight: 500 }}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" style={{ color: 'var(--color-navy)', fontWeight: 500 }}>
                Privacy Policy
              </a>
              .
            </p>

            <Button fullWidth loading={loading} size="lg" type="submit" variant="primary">
              Create Account
            </Button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Already registered?{' '}
              <Link style={{ color: 'var(--color-navy)', fontWeight: 600 }} to="/login">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function getPasswordStrength(password: string) {
  if (!password) return { color: '', label: '', score: 0 }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++

  const map = [
    { color: 'var(--color-coral)', label: 'Weak', score: 1 },
    { color: 'var(--color-amber)', label: 'Fair', score: 2 },
    { color: 'var(--color-sage)', label: 'Good', score: 3 },
    { color: 'var(--color-sage)', label: 'Strong', score: 4 },
  ]
  return map[score - 1] || { color: 'var(--color-coral)', label: 'Weak', score: 1 }
}

const pageStyle: CSSProperties = {
  background: 'var(--surface-elevated)',
  display: 'flex',
  minHeight: '100vh',
}
const brandPanelStyle: CSSProperties = {
  alignItems: 'center',
  background: 'var(--color-navy)',
  backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(232,160,32,0.15) 0%, transparent 50%)',
  display: 'none',
  flex: '0 0 420px',
  justifyContent: 'center',
  padding: '3rem',
}
const formPanelStyle: CSSProperties = {
  alignItems: 'flex-start',
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  overflowY: 'auto',
  padding: '2.5rem 1.5rem',
}
const formContainerStyle: CSSProperties = {
  maxWidth: '420px',
  paddingBottom: '3rem',
  paddingTop: '1rem',
  width: '100%',
}
const logoMiniStyle: CSSProperties = {
  alignItems: 'center',
  background: 'var(--color-navy)',
  borderRadius: 8,
  display: 'flex',
  fontSize: '1rem',
  height: 36,
  justifyContent: 'center',
  width: 36,
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
