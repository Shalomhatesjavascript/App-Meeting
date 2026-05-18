// ============================================
// Profile Page — View & Edit own profile
// ============================================

import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../components/Avatar'
import { AvatarPicker } from '../../components/AvatarPicker'
import { BottomNav } from '../../components/BottomNav'
import { IntentBadge, VerifiedBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Input'
import { useApp } from '../../context/AppContext'
import { useLogoutUserMutation } from '../../hooks/useAuthMutations'
import { useInterestsCatalogQuery } from '../../hooks/useCatalog'
import { useInterestsQuery } from '../../hooks/useInterests'
import { useProfileQuery, useUpdateProfileMutation } from '../../hooks/useProfile'
import { useUserQuery } from '../../hooks/useUser'
import {
  useAddUserInterestMutation,
  useRemoveUserInterestMutation,
  useUserInterestsQuery,
} from '../../hooks/useUserInterests'
import { INTENTS } from '../../shared/catalog'
import type { FrontendProfile } from '../../types'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { data: userData } = useUserQuery()
  const { showToast } = useApp()
  const userId = userData?.id ?? ''
  const profileQuery = useProfileQuery()
  const interestsCatalogQuery = useInterestsCatalogQuery()
  const interestsQuery = useInterestsQuery()
  const userInterestsQuery = useUserInterestsQuery(userId, Boolean(userId))
  const addInterest = useAddUserInterestMutation()
  const removeInterest = useRemoveUserInterestMutation()
  const updateProfileMutation = useUpdateProfileMutation()
  const logoutMutation = useLogoutUserMutation()

  const [editSection, setEditSection] = useState<'avatar' | 'bio' | 'intent' | 'interests' | null>(
    null,
  )
  const [editData, setEditData] = useState<Partial<FrontendProfile>>({})
  const profile = profileQuery.data || null
  const interestOptions = [...(interestsCatalogQuery.data || [])]
  const loading = profileQuery.isLoading || userInterestsQuery.isLoading
  const saving = updateProfileMutation.isPending
  const userInterestNames = useMemo(
    () => (userInterestsQuery.data?.map((interest) => interest.name) ?? []) as string[],
    [userInterestsQuery.data],
  )

  useEffect(() => {
    setEditData(
      profile ? { ...profile, interests: userInterestNames } : { interests: userInterestNames },
    )
  }, [profile, userInterestNames])

  useEffect(() => {
    if (profileQuery.isError) {
      showToast({ message: 'Failed to load profile', type: 'error' })
    }
  }, [profileQuery.isError, showToast])

  useEffect(() => {
    if (interestsCatalogQuery.isError) {
      showToast({ message: 'Failed to load interests', type: 'error' })
    }
  }, [interestsCatalogQuery.isError, showToast])

  useEffect(() => {
    if (userInterestsQuery.isError) {
      showToast({ message: 'Failed to load your interests', type: 'error' })
    }
  }, [userInterestsQuery.isError, showToast])

  const handleSaveSection = async () => {
    try {
      const { interests: updatedInterests = [], ...profileUpdates } = editData

      if (editSection !== 'interests') {
        await updateProfileMutation.mutateAsync(profileUpdates)
      }

      // If editing interests, sync join table
      if (editSection === 'interests' && userId) {
        if (!interestsQuery.data) {
          throw new Error('Interests are still loading')
        }

        const prev = userInterestNames
        const next = updatedInterests
        const toAdd = next.filter((i) => !prev.includes(i))
        const toRemove = prev.filter((i) => !next.includes(i))

        const interestList = interestsQuery.data || []
        const nameToId = new Map<string, number>(interestList.map((it) => [it.name, it.id]))

        await Promise.all([
          ...toAdd
            .map((name) => nameToId.get(name))
            .filter(Boolean)
            .map((id) => addInterest.mutateAsync({ interestId: Number(id), userId })),
          ...toRemove
            .map((name) => nameToId.get(name))
            .filter(Boolean)
            .map((id) => removeInterest.mutateAsync({ interestId: Number(id), userId })),
        ])
      }

      setEditSection(null)
      showToast({ message: 'Profile updated!', type: 'success' })
    } catch {
      showToast({ message: 'Failed to save changes', type: 'error' })
    }
  }

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
    navigate('/login', { replace: true })
  }

  const toggleInterest = (interest: string) => {
    setEditData((prev) => {
      const interests = prev.interests || []
      if (interests.includes(interest))
        return { ...prev, interests: interests.filter((i) => i !== interest) }
      if (interests.length >= 8) return prev
      return { ...prev, interests: [...interests, interest] }
    })
  }

  if (loading) {
    return (
      <div style={{ ...pageStyle, alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            animation: 'spin 0.8s linear infinite',
            border: '3px solid var(--border-light)',
            borderRadius: '50%',
            borderTopColor: 'var(--color-navy)',
            height: 36,
            width: 36,
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const displayProfile: Partial<FrontendProfile> = profile || {}
  const displayInterests = userInterestNames

  return (
    <div style={pageStyle}>
      {/* Header */}
      <header style={{ padding: '1.25rem 1.5rem 0' }}>
        <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
          <h1
            style={{
              color: 'var(--color-navy)',
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 600,
            }}
          >
            My Profile
          </h1>
          <button
            onClick={handleLogout}
            style={{
              alignItems: 'center',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              fontSize: '0.875rem',
              gap: '0.25rem',
            }}
            type="button"
          >
            <LogoutIcon /> Sign out
          </button>
        </div>
      </header>

      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          gap: '1rem',
          overflowY: 'auto',
          padding: '1.25rem 1.5rem',
          paddingBottom: '5rem',
        }}
      >
        {/* Avatar section */}
        <section style={sectionStyle}>
          <div style={{ alignItems: 'center', display: 'flex', gap: '1.25rem' }}>
            <Avatar
              seed={displayProfile.avatarSeed || 'default'}
              showRing
              size={80}
              style={displayProfile.avatarStyle || 'notionists'}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '0.25rem',
                }}
              >
                <h2
                  style={{
                    color: 'var(--color-navy)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                  }}
                >
                  {userData?.name}
                </h2>
                {userData?.isVerified && <VerifiedBadge />}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{userData?.email}</p>
              {displayProfile.department && (
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    marginTop: '0.25rem',
                  }}
                >
                  {displayProfile.department} · {displayProfile.level}L
                </p>
              )}
            </div>
          </div>

          {editSection === 'avatar' ? (
            <div style={{ marginTop: '1.5rem' }}>
              <AvatarPicker
                onSelect={({ avatarSeed, avatarStyle }) =>
                  setEditData((p) => ({ ...p, avatarSeed, avatarStyle }))
                }
                selected={{ avatarSeed: editData.avatarSeed, avatarStyle: editData.avatarStyle }}
              />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <Button
                  fullWidth
                  loading={saving}
                  onClick={handleSaveSection}
                  size="md"
                  variant="primary"
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setEditData(profile || {})
                    setEditData(profile ? { ...profile } : {})
                  }}
                  size="md"
                  variant="ghost"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditSection('avatar')
                setEditData(profile || {})
              }}
              style={editBtnStyle}
              type="button"
            >
              Change avatar
            </button>
          )}
        </section>

        {/* Intent */}
        <section style={sectionStyle}>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.875rem',
            }}
          >
            <h3 style={sectionTitleStyle}>Looking for</h3>
            {editSection !== 'intent' && (
              <button
                onClick={() => {
                  setEditSection('intent')
                  setEditData(profile ?? {})
                }}
                style={editBtnStyle}
                type="button"
              >
                Edit
              </button>
            )}
          </div>
          {editSection === 'intent' ? (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {INTENTS.map((intent) => (
                  <button
                    key={intent.id}
                    onClick={() =>
                      setEditData((p) => ({ ...p, intent: intent.id as FrontendProfile['intent'] }))
                    }
                    style={{
                      alignItems: 'center',
                      background: editData.intent === intent.id ? 'rgba(18,23,74,0.04)' : '#fff',
                      border: `2px solid ${editData.intent === intent.id ? 'var(--color-navy)' : 'var(--border-light)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '0.875rem',
                      padding: '0.875rem',
                      textAlign: 'left',
                    }}
                    type="button"
                  >
                    <span style={{ fontSize: '1.25rem' }}>{intent.emoji}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {intent.label}
                    </span>
                    {editData.intent === intent.id && (
                      <span style={{ color: 'var(--color-navy)', marginLeft: 'auto' }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <Button
                  fullWidth
                  loading={saving}
                  onClick={handleSaveSection}
                  size="md"
                  variant="primary"
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setEditSection(null)
                    setEditData(profile || {})
                  }}
                  size="md"
                  variant="ghost"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <IntentBadge intent={displayProfile.intent || 'friendship'} />
          )}
        </section>

        {/* Bio */}
        <section style={sectionStyle}>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.875rem',
            }}
          >
            <h3 style={sectionTitleStyle}>About me</h3>
            {editSection !== 'bio' && (
              <button
                onClick={() => {
                  setEditSection('bio')
                  setEditData(profile ? { ...profile } : {})
                }}
                style={editBtnStyle}
                type="button"
              >
                Edit
              </button>
            )}
          </div>
          {editSection === 'bio' ? (
            <div>
              <Textarea
                maxLength={400}
                onChange={(e) => setEditData((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Tell people who you are..."
                rows={5}
                value={editData.bio || ''}
              />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.875rem' }}>
                <Button
                  fullWidth
                  loading={saving}
                  onClick={handleSaveSection}
                  size="md"
                  variant="primary"
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setEditSection(null)
                    setEditData(profile ? { ...profile } : {})
                  }}
                  size="md"
                  variant="ghost"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p
              style={{
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                lineHeight: 1.7,
              }}
            >
              {displayProfile.bio || 'No bio yet. Add one to get better matches!'}
            </p>
          )}
        </section>

        {/* Interests */}
        <section style={sectionStyle}>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.875rem',
            }}
          >
            <h3 style={sectionTitleStyle}>Interests</h3>
            {editSection !== 'interests' && (
              <button
                onClick={() => {
                  setEditSection('interests')
                  setEditData(profile ? { ...profile } : {})
                }}
                style={editBtnStyle}
                type="button"
              >
                Edit
              </button>
            )}
          </div>
          {editSection === 'interests' ? (
            <div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '0.875rem',
                }}
              >
                {interestOptions.map((interest) => {
                  const selected = (editData.interests || []).includes(interest)
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      style={{
                        background: selected ? 'var(--color-navy)' : '#fff',
                        border: `2px solid ${selected ? 'var(--color-navy)' : 'var(--border-medium)'}`,
                        borderRadius: 'var(--radius-full)',
                        color: selected ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        padding: '0.375rem 0.875rem',
                        transition: 'all var(--transition-fast)',
                      }}
                      type="button"
                    >
                      {interest}
                    </button>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button
                  fullWidth
                  loading={saving}
                  onClick={handleSaveSection}
                  size="md"
                  variant="primary"
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setEditSection(null)
                    setEditData(profile || {})
                  }}
                  size="md"
                  variant="ghost"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {displayInterests.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No interests added yet
                </p>
              ) : (
                displayInterests.map((interest) => (
                  <span
                    key={interest}
                    style={{
                      background: 'var(--color-cream-dark)',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      padding: '0.3rem 0.75rem',
                    }}
                  >
                    {interest}
                  </span>
                ))
              )}
            </div>
          )}
        </section>

        {/* Account info */}
        <section style={{ ...sectionStyle, background: 'rgba(18,23,74,0.03)' }}>
          <h3 style={{ ...sectionTitleStyle, marginBottom: '0.875rem' }}>Account</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <InfoRow label="Plan" value={userData?.isPremium ? '⭐ Premium' : '✦ Free'} />
            <InfoRow
              label="Joined"
              value={
                userData?.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString('en-GB', {
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Recently'
              }
            />
            <InfoRow label="Status" value={userData?.isVerified ? '✓ Verified' : 'Unverified'} />
          </div>
          {!userData?.isPremium && (
            <button
              onClick={() => showToast({ message: 'Premium coming soon! 🚀', type: 'info' })}
              style={{
                alignItems: 'center',
                background: 'linear-gradient(135deg, var(--color-amber), #f5c553)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-navy)',
                cursor: 'pointer',
                display: 'flex',
                fontSize: '0.9375rem',
                fontWeight: 600,
                gap: '0.5rem',
                justifyContent: 'center',
                marginTop: '1rem',
                padding: '0.75rem',
                width: '100%',
              }}
              type="button"
            >
              ⭐ Upgrade to Premium
            </button>
          )}
        </section>
      </div>

      <BottomNav />
    </div>
  )
}

function InfoRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
        {value}
      </span>
    </div>
  )
}

function LogoutIcon() {
  return (
    <svg
      fill="none"
      height="14"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="14"
    >
      <title>Sign out</title>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  )
}

const pageStyle: CSSProperties = {
  background: 'var(--surface-elevated)',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
}
const sectionStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-sm)',
  padding: '1.25rem',
}
const sectionTitleStyle: CSSProperties = {
  color: 'var(--color-navy)',
  fontFamily: 'var(--font-display)',
  fontSize: '1rem',
  fontWeight: 600,
}
const editBtnStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-navy)',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 600,
  padding: '0.25rem 0',
}
