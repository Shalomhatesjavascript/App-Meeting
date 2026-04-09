import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

export default function VerifyEmailPage() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-md)',
          maxWidth: 460,
          padding: '2rem',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <h1
          style={{
            color: 'var(--color-navy)',
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            marginBottom: '0.75rem',
          }}
        >
          Email Verification Moved
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Verification is now handled by Better Auth. Continue to your profile setup.
        </p>
        <Button onClick={() => navigate('/setup-profile', { replace: true })} variant="primary">
          Continue
        </Button>
      </div>
    </div>
  )
}
