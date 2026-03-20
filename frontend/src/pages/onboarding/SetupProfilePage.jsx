// ============================================
// Profile Setup Page — Multi-step onboarding
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveProfile } from '../../api/profile';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { AvatarPicker } from '../../components/AvatarPicker';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { DEPARTMENTS, LEVELS, INTENTS, INTERESTS } from '../../utils/mockData';

const STEPS = ['avatar', 'basics', 'intent', 'interests', 'bio'];

export default function SetupProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { showToast } = useApp();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    avatarStyle: 'notionists',
    avatarSeed: 'felix',
    department: '',
    level: '',
    gender: '',
    intent: '',
    interests: [],
    bio: '',
  });

  const setField = (field) => (value) => setProfile(p => ({ ...p, [field]: value }));

  const totalSteps = STEPS.length;
  const currentStep = STEPS[step];
  const progress = ((step) / (totalSteps - 1)) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 'avatar': return profile.avatarStyle && profile.avatarSeed;
      case 'basics': return profile.department && profile.level && profile.gender;
      case 'intent': return !!profile.intent;
      case 'interests': return profile.interests.length >= 2;
      case 'bio': return profile.bio.trim().length >= 30;
      default: return true;
    }
  };

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
      return;
    }
    // Final step — save
    setSaving(true);
    try {
      await saveProfile({ ...profile, userId: user?.id });
      updateUser({ profileComplete: true, profile });
      showToast({ message: 'Profile created! Welcome 🎉', type: 'success' });
      navigate('/app/discover', { replace: true });
    } catch (err) {
      showToast({ message: 'Failed to save profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const toggleInterest = (interest) => {
    setProfile(p => {
      const exists = p.interests.includes(interest);
      if (exists) return { ...p, interests: p.interests.filter(i => i !== interest) };
      if (p.interests.length >= 8) return p; // max 8
      return { ...p, interests: [...p.interests, interest] };
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-elevated)',
    }}>
      {/* Header */}
      <div style={{
        padding: '1.25rem 1.5rem 0',
        maxWidth: 540,
        width: '100%',
        margin: '0 auto',
      }}>
        {/* Progress */}
        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-navy)' }}>
              Set up your profile
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {step + 1} of {totalSteps}
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 4, background: 'var(--border-light)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(step / (totalSteps - 1)) * 100}%`,
              background: 'var(--color-navy)',
              borderRadius: 4,
              transition: 'width var(--transition-slow)',
            }} />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div style={{
        flex: 1,
        padding: '1.5rem',
        maxWidth: 540,
        width: '100%',
        margin: '0 auto',
        overflowY: 'auto',
      }}>
        <div style={{ animation: 'fadeSlideUp 0.35s both' }} key={step}>
          {currentStep === 'avatar' && (
            <StepAvatar profile={profile} onSelect={(av) => setProfile(p => ({ ...p, ...av }))} />
          )}
          {currentStep === 'basics' && (
            <StepBasics profile={profile} setField={setField} />
          )}
          {currentStep === 'intent' && (
            <StepIntent profile={profile} setField={setField} />
          )}
          {currentStep === 'interests' && (
            <StepInterests profile={profile} onToggle={toggleInterest} />
          )}
          {currentStep === 'bio' && (
            <StepBio profile={profile} setField={setField} />
          )}
        </div>
      </div>

      {/* Footer navigation */}
      <div style={{
        padding: '1rem 1.5rem',
        paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
        background: '#fff',
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        gap: '0.75rem',
        maxWidth: 540,
        width: '100%',
        margin: '0 auto',
      }}>
        {step > 0 && (
          <Button variant="secondary" size="lg" onClick={handleBack} style={{ flex: '0 0 auto' }}>
            Back
          </Button>
        )}
        <Button
          variant={step === totalSteps - 1 ? 'amber' : 'primary'}
          size="lg"
          fullWidth
          onClick={handleNext}
          disabled={!canProceed()}
          loading={saving}
        >
          {step === totalSteps - 1 ? 'Complete Profile 🎉' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}

// ---- Step Components ----

function StepAvatar({ profile, onSelect }) {
  return (
    <div>
      <h2 style={stepTitleStyle}>Choose your avatar</h2>
      <p style={stepDescStyle}>
        Your avatar is the first thing others see. Pick one that feels like you — no photos required.
      </p>
      <AvatarPicker
        selected={{ style: profile.avatarStyle, seed: profile.avatarSeed }}
        onSelect={onSelect}
      />
    </div>
  );
}

function StepBasics({ profile, setField }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={stepTitleStyle}>The basics</h2>
        <p style={stepDescStyle}>Help others know who you are on campus.</p>
      </div>

      {/* Department */}
      <div>
        <label style={selectLabelStyle}>Department *</label>
        <select
          value={profile.department}
          onChange={e => setField('department')(e.target.value)}
          style={selectStyle}
        >
          <option value="">Select your department</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Level */}
      <div>
        <label style={selectLabelStyle}>Level *</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {LEVELS.map(l => (
            <button
              key={l}
              onClick={() => setField('level')(l)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                border: `2px solid ${profile.level === l ? 'var(--color-navy)' : 'var(--border-medium)'}`,
                background: profile.level === l ? 'var(--color-navy)' : '#fff',
                color: profile.level === l ? '#fff' : 'var(--text-secondary)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                fontSize: '0.9375rem',
              }}
            >
              {l}L
            </button>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div>
        <label style={selectLabelStyle}>Gender *</label>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {['Male', 'Female', 'Other'].map(g => (
            <button
              key={g}
              onClick={() => setField('gender')(g.toLowerCase())}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${profile.gender === g.toLowerCase() ? 'var(--color-navy)' : 'var(--border-medium)'}`,
                background: profile.gender === g.toLowerCase() ? 'var(--color-navy)' : '#fff',
                color: profile.gender === g.toLowerCase() ? '#fff' : 'var(--text-secondary)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                fontSize: '0.9375rem',
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepIntent({ profile, setField }) {
  return (
    <div>
      <h2 style={stepTitleStyle}>What are you here for?</h2>
      <p style={stepDescStyle}>
        Be honest — this helps us show you to people with similar goals.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '1.5rem' }}>
        {INTENTS.map(intent => (
          <button
            key={intent.id}
            onClick={() => setField('intent')(intent.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.125rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: `2px solid ${profile.intent === intent.id ? 'var(--color-navy)' : 'var(--border-light)'}`,
              background: profile.intent === intent.id ? 'rgba(18,23,74,0.04)' : '#fff',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              textAlign: 'left',
              width: '100%',
              boxShadow: profile.intent === intent.id ? 'none' : 'var(--shadow-sm)',
            }}
          >
            <span style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: `${intent.color}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.375rem',
              flexShrink: 0,
            }}>
              {intent.emoji}
            </span>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{intent.label}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {intent.id === 'friendship' && 'Find people to hang out and vibe with'}
                {intent.id === 'dating' && 'Explore romantic connections on campus'}
                {intent.id === 'networking' && 'Build professional relationships'}
                {intent.id === 'study_buddy' && 'Find focused, like-minded study partners'}
              </p>
            </div>
            {profile.intent === intent.id && (
              <div style={{ marginLeft: 'auto', color: 'var(--color-navy)', flexShrink: 0 }}>
                <CheckIcon />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepInterests({ profile, onToggle }) {
  return (
    <div>
      <h2 style={stepTitleStyle}>Your interests</h2>
      <p style={stepDescStyle}>
        Select 2–8 things you genuinely care about. This drives your matches.
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {profile.interests.length} selected
        </span>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>max 8</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
        {INTERESTS.map(interest => {
          const selected = profile.interests.includes(interest);
          return (
            <button
              key={interest}
              onClick={() => onToggle(interest)}
              style={{
                padding: '0.5rem 1.125rem',
                borderRadius: 'var(--radius-full)',
                border: `2px solid ${selected ? 'var(--color-navy)' : 'var(--border-medium)'}`,
                background: selected ? 'var(--color-navy)' : '#fff',
                color: selected ? '#fff' : 'var(--text-secondary)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                fontSize: '0.875rem',
                transform: selected ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {interest}
            </button>
          );
        })}
      </div>
      {profile.interests.length < 2 && (
        <p style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Select at least 2 interests to continue
        </p>
      )}
    </div>
  );
}

function StepBio({ profile, setField }) {
  const wordCount = profile.bio.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div>
      <h2 style={stepTitleStyle}>Tell your story</h2>
      <p style={stepDescStyle}>
        Your bio is your first impression. Be authentic — people connect with real personalities, not resumes.
      </p>

      <div style={{
        padding: '1rem 1.25rem',
        background: 'rgba(18,23,74,0.04)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)',
        marginBottom: '1.5rem',
        marginTop: '1rem',
      }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          💡 <strong>Pro tip:</strong> Mention your passions, a quirky fact about yourself, or what you're looking for. Avoid generic statements like "I love to have fun."
        </p>
      </div>

      <Textarea
        label="Your Bio"
        value={profile.bio}
        onChange={e => setField('bio')(e.target.value)}
        placeholder='e.g. "400L CS student who can talk about distributed systems and Afrobeats all day. Currently building a fintech side project and looking for people who debate ideas seriously. Ask me about my worst hackathon story..."'
        rows={6}
        maxLength={400}
        required
        hint={profile.bio.length < 30 ? `At least ${30 - profile.bio.length} more characters needed` : `${wordCount} words — looking good!`}
      />
    </div>
  );
}

// ---- Shared styles ----
const stepTitleStyle = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.625rem',
  fontWeight: 600,
  color: 'var(--color-navy)',
  marginBottom: '0.5rem',
  lineHeight: 1.25,
};
const stepDescStyle = {
  fontSize: '0.9375rem',
  color: 'var(--text-secondary)',
  lineHeight: 1.6,
  marginBottom: '1.5rem',
};
const selectLabelStyle = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '0.5rem',
};
const selectStyle = {
  width: '100%',
  padding: '0.65rem 0.875rem',
  borderRadius: 'var(--radius-md)',
  border: '2px solid var(--border-medium)',
  background: '#fff',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9375rem',
  color: 'var(--text-primary)',
  outline: 'none',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='%234a5280' strokeWidth='1.5' strokeLinecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 1rem center',
};

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
