import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BabcockEmailSchema } from '@repo/shared'
import {
  getPendingOtp,
  resendVerificationCode,
  sendSignInCode,
  verifyEmailCode,
  verifySignInCode,
} from '../../api/auth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import * as v from 'valibot'

type VerifyLocationState = Readonly<{
  email?: string
  from?: { pathname?: string }
  name?: string
  type?: 'email-verification' | 'sign-in'
}>

export default function VerifyEmailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useApp()

  const locationState = (location.state || {}) as VerifyLocationState

  const pendingOtp = getPendingOtp()
  const initialEmail = locationState.email || pendingOtp?.email || ''
  const initialType = locationState.type || pendingOtp?.type || 'email-verification'

  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState('')
  const [type, setType] = useState(initialType)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (locationState.email) {
      setEmail(locationState.email)
    }

    if (locationState.type) {
      setType(locationState.type)
    }
  }, [locationState.email, locationState.type])

  const isSignIn = type === 'sign-in'

  const handleResend = async () => {
    const result = v.safeParse(BabcockEmailSchema, email)
    if (!result.success) {
      setError(result.issues[0]?.message || 'Enter a valid university email')
      return
    }

    setError('')
    setSending(true)

    try {
      if (isSignIn) {
        await sendSignInCode({ email })
      } else {
        await resendVerificationCode({ email })
      }

      showToast({
        message: isSignIn ? 'Sign-in code sent again.' : 'Verification code sent again.',
        type: 'success',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend verification code'
      setError(message)
      showToast({ message, type: 'error' })
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const emailResult = v.safeParse(BabcockEmailSchema, email)
    if (!emailResult.success) {
      setError(emailResult.issues[0]?.message || 'Enter a valid university email')
      return
    }

    if (!otp.trim()) {
      setError('Enter the 6-digit code from your email')
      return
    }

    setError('')
    setLoading(true)

    try {
      const result = isSignIn
        ? await verifySignInCode({ email, otp: otp.trim() })
        : await verifyEmailCode({ email, otp: otp.trim() })

      login(result.user)

      if (!result.user.profileComplete) {
        navigate('/setup-profile', { replace: true })
      } else {
        navigate('/app/discover', { replace: true })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed'
      setError(message)
      showToast({
        message,
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const heading = isSignIn ? 'Enter your sign-in code' : 'Verify your email'
  const description = isSignIn
    ? 'We emailed a 6-digit code to your university address. Use it to finish signing in.'
    : 'We emailed a 6-digit code after account creation. Enter it to verify your account.'

  return (
    <div
      style={{
        alignItems: 'center',
        background: 'linear-gradient(135deg, #08121f 0%, #13263d 52%, #f59e0b 180%)',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 30px 80px rgba(3, 7, 18, 0.35)',
          maxWidth: 520,
          padding: '2rem',
          width: '100%',
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--color-amber)', fontSize: '0.8125rem', fontWeight: 700 }}>
            Better Auth OTP
          </p>
          <h1
            style={{
              color: 'var(--color-navy)',
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              marginBottom: '0.5rem',
            }}
          >
            {heading}
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{description}</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <Input
            autoComplete="email"
            error={error?.toLowerCase().includes('email') ? error : ''}
            label="University Email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />

          <Input
            autoComplete="one-time-code"
            error={error?.toLowerCase().includes('email') ? '' : error}
            label="Verification Code"
            onChange={(event) => setOtp(event.target.value)}
            placeholder="123456"
            type="text"
            value={otp}
          />

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button fullWidth loading={loading} size="lg" type="submit" variant="primary">
              Confirm code
            </Button>
            <Button
              fullWidth
              loading={sending}
              onClick={handleResend}
              size="lg"
              type="button"
              variant="secondary"
            >
              Resend
            </Button>
          </div>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Button onClick={() => navigate('/login', { replace: true })} variant="ghost">
            Back to sign in
          </Button>
        </div>
      </div>
    </div>
  )
}
