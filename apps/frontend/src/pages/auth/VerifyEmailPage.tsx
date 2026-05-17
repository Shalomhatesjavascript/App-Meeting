import { BabcockEmailSchema } from '@repo/shared'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as v from 'valibot'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useApp } from '../../context/AppContext'
import {
  useResendVerificationCodeMutation,
  useSendSignInCodeMutation,
  useVerifyEmailCodeMutation,
  useVerifySignInCodeMutation,
} from '../../hooks/useAuthMutations'
import backendApi from '../../server/eden-treaty'

type VerifyLocationState = Readonly<{
  email?: string
  from?: { pathname?: string }
  name?: string
  type?: 'email-verification' | 'sign-in'
}>

export default function VerifyEmailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useApp()
  const sendSignInCodeMutation = useSendSignInCodeMutation()
  const resendVerificationCodeMutation = useResendVerificationCodeMutation()
  const verifySignInCodeMutation = useVerifySignInCodeMutation()
  const verifyEmailCodeMutation = useVerifyEmailCodeMutation()

  const locationState = (location.state || {}) as VerifyLocationState

  const initialEmail = locationState.email || ''
  const initialType = locationState.type || 'email-verification'

  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState('')
  const [type, setType] = useState(initialType)
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

    try {
      if (isSignIn) {
        await sendSignInCodeMutation.mutateAsync({ email })
      } else {
        await resendVerificationCodeMutation.mutateAsync({ email })
      }

      showToast({
        message: isSignIn ? 'Sign-in code sent again.' : 'Verification code sent again.',
        type: 'success',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend verification code'
      setError(message)
      showToast({ message, type: 'error' })
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

    try {
      if (isSignIn) {
        await verifySignInCodeMutation.mutateAsync({ email, otp: otp.trim() })
      } else {
        await verifyEmailCodeMutation.mutateAsync({ email, otp: otp.trim() })
      }

      let profile = null
      try {
        const response = await backendApi.api.profiles.me.get()
        profile = response.data
      } catch {
        profile = null
      }

      if (!profile) {
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
    }
  }

  const loading = verifySignInCodeMutation.isPending || verifyEmailCodeMutation.isPending
  const sending = sendSignInCodeMutation.isPending || resendVerificationCodeMutation.isPending

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
