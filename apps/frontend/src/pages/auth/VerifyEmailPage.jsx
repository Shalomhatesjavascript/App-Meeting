// ============================================
// Email Verification Page
// ============================================

import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { resendVerificationEmail, verifyEmail } from '../../api/auth'
import { Button } from '../../components/ui/Button'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'

const CODE_SLOT_KEYS = ['digit-1', 'digit-2', 'digit-3', 'digit-4', 'digit-5', 'digit-6']

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, updateUser } = useAuth()
  const { showToast } = useApp()

  const email = user?.email || location.state?.email || ''
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [error, setError] = useState('')

  const inputRefs = useRef([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendCooldown])

  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const val = value.slice(-1)
    const newCode = [...code]
    newCode[index] = val
    setCode(newCode)
    setError('')

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all filled
    if (val && index === 5) {
      const fullCode = [...newCode.slice(0, 5), val].join('')
      if (fullCode.length === 6) {
        handleVerify(fullCode)
      }
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted) {
      const newCode = pasted.split('').concat(['', '', '', '', '', '']).slice(0, 6)
      setCode(newCode)
      const lastFilled = Math.min(pasted.length, 5)
      inputRefs.current[lastFilled]?.focus()
      if (pasted.length === 6) handleVerify(pasted)
    }
  }

  const handleVerify = async (fullCode) => {
    const codeStr = fullCode || code.join('')
    if (codeStr.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await verifyEmail({ code: codeStr, email })
      const verifiedUser = updateUser(res.user) || res.user
      showToast({ message: 'Email verified! 🎉', type: 'success' })
      navigate(verifiedUser?.profileComplete ? '/app/discover' : '/setup-profile', {
        replace: true,
      })
    } catch (err) {
      setError(err.message)
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setResending(true)
    try {
      const { verificationCode } = await resendVerificationEmail({ email })
      if (verificationCode) {
        const nextCode = verificationCode.split('')
        setCode(nextCode.concat(['', '', '', '', '', '']).slice(0, 6))
      }
      showToast({ message: 'Verification code resent!', type: 'success' })
      setResendCooldown(60)
    } catch {
      showToast({ message: 'Failed to resend. Try again.', type: 'error' })
    } finally {
      setResending(false)
    }
  }

  return (
    <div
      style={{
        alignItems: 'center',
        background: 'var(--surface-elevated)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        style={{
          animation: 'fadeSlideUp 0.4s both',
          maxWidth: '440px',
          width: '100%',
        }}
      >
        {/* Icon */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div
            style={{
              alignItems: 'center',
              background: 'var(--color-navy)',
              borderRadius: '50%',
              display: 'flex',
              fontSize: '2rem',
              height: 80,
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              width: 80,
            }}
          >
            ✉️
          </div>
          <h1
            style={{
              color: 'var(--color-navy)',
              fontFamily: 'var(--font-display)',
              fontSize: '1.875rem',
              fontWeight: 600,
              marginBottom: '0.625rem',
            }}
          >
            Check your inbox
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            We sent a 6-digit verification code to
          </p>
          <p style={{ color: 'var(--color-navy)', fontWeight: 600, wordBreak: 'break-all' }}>
            {email}
          </p>
        </div>

        {/* Code inputs */}
        <div
          style={{
            background: '#fff',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '1.5rem',
            padding: '2rem',
          }}
        >
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              letterSpacing: '0.06em',
              marginBottom: '1rem',
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          >
            Enter verification code
          </p>

          <div
            onPaste={handlePaste}
            style={{
              display: 'flex',
              gap: '0.625rem',
              justifyContent: 'center',
              marginBottom: '1.25rem',
            }}
          >
            {code.map((digit, index) => (
              <input
                inputMode="numeric"
                key={CODE_SLOT_KEYS[index]}
                maxLength={1}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                style={{
                  background: digit ? 'rgba(18,23,74,0.04)' : '#fff',
                  border: `2px solid ${error ? 'var(--color-coral)' : digit ? 'var(--color-navy)' : 'var(--border-medium)'}`,
                  borderRadius: 'var(--radius-md)',
                  caretColor: 'transparent',
                  color: 'var(--color-navy)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  height: '3.5rem',
                  outline: 'none',
                  textAlign: 'center',
                  transition: 'all var(--transition-fast)',
                  width: '3rem',
                }}
                type="text"
                value={digit}
              />
            ))}
          </div>

          {error && (
            <p
              style={{
                color: 'var(--color-coral)',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                textAlign: 'center',
              }}
            >
              {error}
            </p>
          )}

          <Button
            disabled={code.join('').length !== 6}
            fullWidth
            loading={loading}
            onClick={() => handleVerify()}
            size="lg"
            variant="primary"
          >
            Verify Email
          </Button>
        </div>

        {/* Demo hint */}
        <div
          style={{
            background: 'rgba(232,160,32,0.1)',
            border: '1px solid rgba(232,160,32,0.3)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            padding: '0.875rem',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#8a6010', fontSize: '0.8125rem' }}>
            💡 <strong>Demo mode:</strong> 123456 always works locally, and resend will refresh the
            code when available.
          </p>
        </div>

        {/* Resend */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Didn't receive it?{' '}
            <button
              disabled={resendCooldown > 0 || resending}
              onClick={handleResend}
              style={{
                background: 'none',
                border: 'none',
                color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--color-navy)',
                cursor: resendCooldown > 0 ? 'default' : 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                fontWeight: 600,
              }}
              type="button"
            >
              {resending
                ? 'Sending...'
                : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend code'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
