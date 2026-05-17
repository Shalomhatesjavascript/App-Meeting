// ============================================
// Profile Setup Page — Multi-step onboarding
// ============================================

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DEPARTMENTS, INTENTS, LEVELS } from '../../shared/catalog'
import { AvatarPicker } from '../../components/AvatarPicker'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Input'
import { useApp } from '../../context/AppContext'
import { useInterestsCatalogQuery } from '../../hooks/useCatalog'
import { useSaveProfileMutation } from '../../hooks/useProfile'
import type { AvatarChoice, AvatarStyle, FrontendProfile, ProfileFormValues } from '../../types'
import { useUserQuery } from '../../hooks/useUser'

const STEPS = ['avatar', 'basics', 'intent', 'interests', 'bio'] as const
type IntentValue = 'Dating' | 'Friendship' | 'Networking' | 'Studying'
type ProfileDraft = Readonly<{
  alias: string
  avatarSeed: string
  avatarStyle: AvatarStyle
  bio: string
  department: string
  fullName: string
  gender: FrontendProfile['gender'] | ''
  intent: IntentValue
  interests: string[]
  isIdVerified: boolean
  level: number
}>
type SetField = <K extends keyof ProfileDraft>(field: K) => (value: ProfileDraft[K]) => void

export default function SetupProfilePage() {
  const navigate = useNavigate()
  const { data: userData } = useUserQuery()
  const { showToast } = useApp()
  const interestsCatalogQuery = useInterestsCatalogQuery()
  const saveProfileMutation = useSaveProfileMutation()

  const [step, setStep] = useState(0)
  const interestOptions = interestsCatalogQuery.data || []

  const [profile, setProfile] = useState<ProfileDraft>({
    alias: userData?.name?.split(' ')[0] || 'Student',
    avatarSeed: 'felix',
    avatarStyle: 'notionists',
    bio: '',
    department: '',
    fullName: userData?.name || '',
    gender: '',
    intent: 'Friendship',
    interests: [],
    isIdVerified: false,
    level: 100,
  })

  useEffect(() => {
    if (interestsCatalogQuery.isError) {
      showToast({ message: 'Failed to load interests', type: 'error' })
    }
  }, [interestsCatalogQuery.isError, showToast])

  const setField: SetField =
    <K extends keyof ProfileDraft>(field: K) =>
    (value: ProfileDraft[K]) =>
      setProfile((p) => ({ ...p, [field]: value }))

  const totalSteps = STEPS.length
  const currentStep = STEPS[step]

  const canProceed = () => {
    switch (currentStep) {
      case 'avatar':
        return profile.avatarStyle && profile.avatarSeed
      case 'basics':
        return profile.department && profile.level && profile.gender
      case 'intent':
        return !!profile.intent
      case 'interests':
        return profile.interests.length >= 2
      case 'bio':
        return profile.bio.trim().length >= 30
      default:
        return true
    }
  }

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1)
      return
    }
    // Final step — save
    try {
      if (!userData?.id) {
        throw new Error('User not loaded')
      }

      const payload = {
        ...profile,
        gender: profile.gender || 'RatherNotSay',
        level: Number(profile.level) as ProfileFormValues['level'],
        userId: userData.id,
      } as ProfileFormValues & { userId: string }
      const result = await saveProfileMutation.mutateAsync(payload)
      if (!result.profile) {
        throw new Error('Failed to save profile')
      }
      showToast({ message: 'Profile created! Welcome 🎉', type: 'success' })
      navigate('/app/discover', { replace: true })
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : 'Failed to save profile',
        type: 'error',
      })
    }
  }

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  const toggleInterest = (interest: string) => {
    setProfile((p) => {
      const exists = p.interests.includes(interest)
      if (exists) return { ...p, interests: p.interests.filter((i) => i !== interest) }
      if (p.interests.length >= 8) return p // max 8
      return { ...p, interests: [...p.interests, interest] }
    })
  }

  return (
    <div
      style={{
        background: 'var(--surface-elevated)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div
        style={{
          margin: '0 auto',
          maxWidth: 540,
          padding: '1.25rem 1.5rem 0',
          width: '100%',
        }}
      >
        {/* Progress */}
        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--color-navy)', fontSize: '0.8125rem', fontWeight: 600 }}>
              Set up your profile
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              {step + 1} of {totalSteps}
            </span>
          </div>
          <div
            style={{
              background: 'var(--border-light)',
              borderRadius: 4,
              height: 4,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                background: 'var(--color-navy)',
                borderRadius: 4,
                height: '100%',
                transition: 'width var(--transition-slow)',
                width: `${(step / (totalSteps - 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div
        style={{
          flex: 1,
          margin: '0 auto',
          maxWidth: 540,
          overflowY: 'auto',
          padding: '1.5rem',
          width: '100%',
        }}
      >
        <div key={step} style={{ animation: 'fadeSlideUp 0.35s both' }}>
          {currentStep === 'avatar' && (
            <StepAvatar onSelect={(av) => setProfile((p) => ({ ...p, ...av }))} profile={profile} />
          )}
          {currentStep === 'basics' && <StepBasics profile={profile} setField={setField} />}
          {currentStep === 'intent' && <StepIntent profile={profile} setField={setField} />}
          {currentStep === 'interests' && (
            <StepInterests onToggle={toggleInterest} options={interestOptions} profile={profile} />
          )}
          {currentStep === 'bio' && <StepBio profile={profile} setField={setField} />}
        </div>
      </div>

      {/* Footer navigation */}
      <div
        style={{
          background: '#fff',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          gap: '0.75rem',
          margin: '0 auto',
          maxWidth: 540,
          padding: '1rem 1.5rem',
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
          width: '100%',
        }}
      >
        {step > 0 && (
          <Button onClick={handleBack} size="lg" style={{ flex: '0 0 auto' }} variant="secondary">
            Back
          </Button>
        )}
        <Button
          disabled={!canProceed()}
          fullWidth
          loading={saveProfileMutation.isPending}
          onClick={handleNext}
          size="lg"
          variant={step === totalSteps - 1 ? 'amber' : 'primary'}
        >
          {step === totalSteps - 1 ? 'Complete Profile 🎉' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}

// ---- Step Components ----

function StepAvatar({
  profile,
  onSelect,
}: Readonly<{
  onSelect: (choice: AvatarChoice) => void
  profile: ProfileDraft
}>) {
  return (
    <div>
      <h2 style={stepTitleStyle}>Choose your avatar</h2>
      <p style={stepDescStyle}>
        Your avatar is the first thing others see. Pick one that feels like you — no photos
        required.
      </p>
      <AvatarPicker
        onSelect={onSelect}
        selected={{ avatarSeed: profile.avatarSeed, avatarStyle: profile.avatarStyle }}
      />
    </div>
  )
}

function StepBasics({
  profile,
  setField,
}: Readonly<{ profile: ProfileDraft; setField: SetField }>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={stepTitleStyle}>The basics</h2>
        <p style={stepDescStyle}>Help others know who you are on campus.</p>
      </div>

      {/* Department */}
      <div>
        <label htmlFor="department-select" style={selectLabelStyle}>
          Department *
        </label>
        <select
          id="department-select"
          onChange={(e) => setField('department')(e.target.value)}
          style={selectStyle}
          value={profile.department}
        >
          <option value="">Select your department</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Level */}
      <div>
        <p style={selectLabelStyle}>Level *</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setField('level')(Number(l))}
              style={{
                background: profile.level === Number(l) ? 'var(--color-navy)' : '#fff',
                border: `2px solid ${profile.level === Number(l) ? 'var(--color-navy)' : 'var(--border-medium)'}`,
                borderRadius: 'var(--radius-full)',
                color: profile.level === Number(l) ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.9375rem',
                fontWeight: 500,
                padding: '0.5rem 1.25rem',
                transition: 'all var(--transition-fast)',
              }}
              type="button"
            >
              {l}L
            </button>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div>
        <p style={selectLabelStyle}>Gender *</p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {['Male', 'Female', 'Other'].map((g) => (
            <button
              key={g}
              onClick={() =>
                setField('gender')((g === 'Other' ? 'RatherNotSay' : g) as ProfileDraft['gender'])
              }
              style={{
                background: profile.gender === g.toLowerCase() ? 'var(--color-navy)' : '#fff',
                border: `2px solid ${profile.gender === g.toLowerCase() ? 'var(--color-navy)' : 'var(--border-medium)'}`,
                borderRadius: 'var(--radius-md)',
                color: profile.gender === g.toLowerCase() ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                flex: 1,
                fontSize: '0.9375rem',
                fontWeight: 500,
                padding: '0.75rem',
                transition: 'all var(--transition-fast)',
              }}
              type="button"
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function StepIntent({
  profile,
  setField,
}: Readonly<{ profile: ProfileDraft; setField: SetField }>) {
  return (
    <div>
      <h2 style={stepTitleStyle}>What are you here for?</h2>
      <p style={stepDescStyle}>Be honest — this helps us show you to people with similar goals.</p>
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '1.5rem' }}
      >
        {INTENTS.map((intent) => (
          <button
            key={intent.id}
            onClick={() => setField('intent')(intent.id as IntentValue)}
            style={{
              alignItems: 'center',
              background: profile.intent === intent.id ? 'rgba(18,23,74,0.04)' : '#fff',
              border: `2px solid ${profile.intent === intent.id ? 'var(--color-navy)' : 'var(--border-light)'}`,
              borderRadius: 'var(--radius-lg)',
              boxShadow: profile.intent === intent.id ? 'none' : 'var(--shadow-sm)',
              cursor: 'pointer',
              display: 'flex',
              gap: '1rem',
              padding: '1.125rem 1.25rem',
              textAlign: 'left',
              transition: 'all var(--transition-fast)',
              width: '100%',
            }}
            type="button"
          >
            <span
              style={{
                alignItems: 'center',
                background: `${intent.color}18`,
                borderRadius: '50%',
                display: 'flex',
                flexShrink: 0,
                fontSize: '1.375rem',
                height: 44,
                justifyContent: 'center',
                width: 44,
              }}
            >
              {intent.emoji}
            </span>
            <div>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '2px' }}>
                {intent.label}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                {intent.id === 'Friendship' && 'Find people to hang out and vibe with'}
                {intent.id === 'Dating' && 'Explore romantic connections on campus'}
                {intent.id === 'Networking' && 'Build professional relationships'}
                {intent.id === 'Studying' && 'Find focused, like-minded study partners'}
              </p>
            </div>
            {profile.intent === intent.id && (
              <div style={{ color: 'var(--color-navy)', flexShrink: 0, marginLeft: 'auto' }}>
                <CheckIcon />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepInterests({
  profile,
  onToggle,
  options,
}: Readonly<{
  onToggle: (interest: string) => void
  options: readonly string[]
  profile: ProfileDraft
}>) {
  return (
    <div>
      <h2 style={stepTitleStyle}>Your interests</h2>
      <p style={stepDescStyle}>
        Select 2–8 things you genuinely care about. This drives your matches.
      </p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          marginTop: '0.5rem',
        }}
      >
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
          {profile.interests.length} selected
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>max 8</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
        {options.map((interest) => {
          const selected = profile.interests.includes(interest)
          return (
            <button
              key={interest}
              onClick={() => onToggle(interest)}
              style={{
                background: selected ? 'var(--color-navy)' : '#fff',
                border: `2px solid ${selected ? 'var(--color-navy)' : 'var(--border-medium)'}`,
                borderRadius: 'var(--radius-full)',
                color: selected ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                padding: '0.5rem 1.125rem',
                transform: selected ? 'scale(1.02)' : 'scale(1)',
                transition: 'all var(--transition-fast)',
              }}
              type="button"
            >
              {interest}
            </button>
          )
        })}
      </div>
      {profile.interests.length < 2 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '1rem' }}>
          Select at least 2 interests to continue
        </p>
      )}
    </div>
  )
}

function StepBio({ profile, setField }: Readonly<{ profile: ProfileDraft; setField: SetField }>) {
  const wordCount = profile.bio.trim().split(/\s+/).filter(Boolean).length

  return (
    <div>
      <h2 style={stepTitleStyle}>Tell your story</h2>
      <p style={stepDescStyle}>
        Your bio is your first impression. Be authentic — people connect with real personalities,
        not resumes.
      </p>

      <div
        style={{
          background: 'rgba(18,23,74,0.04)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          marginTop: '1rem',
          padding: '1rem 1.25rem',
        }}
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.7 }}>
          💡 <strong>Pro tip:</strong> Mention your passions, a quirky fact about yourself, or what
          you're looking for. Avoid generic statements like "I love to have fun."
        </p>
      </div>

      <Textarea
        hint={
          profile.bio.length < 30
            ? `At least ${30 - profile.bio.length} more characters needed`
            : `${wordCount} words — looking good!`
        }
        label="Your Bio"
        maxLength={400}
        onChange={(e) => setField('bio')(e.target.value)}
        placeholder='e.g. "400L CS student who can talk about distributed systems and Afrobeats all day. Currently building a fintech side project and looking for people who debate ideas seriously. Ask me about my worst hackathon story..."'
        required
        rows={6}
        value={profile.bio}
      />
    </div>
  )
}

// ---- Shared styles ----
const stepTitleStyle = {
  color: 'var(--color-navy)',
  fontFamily: 'var(--font-display)',
  fontSize: '1.625rem',
  fontWeight: 600,
  lineHeight: 1.25,
  marginBottom: '0.5rem',
}
const stepDescStyle = {
  color: 'var(--text-secondary)',
  fontSize: '0.9375rem',
  lineHeight: 1.6,
  marginBottom: '1.5rem',
}
const selectLabelStyle = {
  color: 'var(--text-secondary)',
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 500,
  letterSpacing: '0.06em',
  marginBottom: '0.5rem',
  textTransform: 'uppercase',
}
const selectStyle: import('react').CSSProperties = {
  appearance: 'none',
  background: '#fff',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='%234a5280' strokeWidth='1.5' strokeLinecap='round'/%3E%3C/svg%3E")`,
  backgroundPosition: 'right 1rem center',
  backgroundRepeat: 'no-repeat',
  border: '2px solid var(--border-medium)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9375rem',
  outline: 'none',
  padding: '0.65rem 0.875rem',
  width: '100%',
}

function CheckIcon() {
  return (
    <svg
      fill="none"
      height="18"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      width="18"
    >
      <title>Selected</title>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
