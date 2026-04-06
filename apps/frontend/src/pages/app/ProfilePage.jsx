// ============================================
// Profile Page — View & Edit own profile
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../../api/profile';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../../components/Avatar';
import { IntentBadge, VerifiedBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { AvatarPicker } from '../../components/AvatarPicker';
import { BottomNav } from '../../components/BottomNav';
import { INTENTS, INTERESTS, DEPARTMENTS, LEVELS } from '../../utils/mockData';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { showToast } = useApp();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editSection, setEditSection] = useState(null); // 'avatar' | 'bio' | 'intent' | 'interests'
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    getProfile().then(p => {
      setProfile(p);
      setEditData(p || {});
    }).finally(() => setLoading(false));
  }, []);

  const handleSaveSection = async () => {
    setSaving(true);
    try {
      const { profile: updated } = await updateProfile(editData);
      setProfile(updated);
      updateUser({ profile: updated });
      setEditSection(null);
      showToast({ message: 'Profile updated!', type: 'success' });
    } catch {
      showToast({ message: 'Failed to save changes', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const toggleInterest = (interest) => {
    setEditData(prev => {
      const interests = prev.interests || [];
      if (interests.includes(interest)) return { ...prev, interests: interests.filter(i => i !== interest) };
      if (interests.length >= 8) return prev;
      return { ...prev, interests: [...interests, interest] };
    });
  };

  if (loading) {
    return (
      <div style={{ ...pageStyle, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid var(--border-light)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const displayProfile = profile || {};

  return (
    <div style={pageStyle}>
      {/* Header */}
      <header style={{ padding: '1.25rem 1.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)' }}>
            My Profile
          </h1>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <LogoutIcon /> Sign out
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '5rem' }}>
        {/* Avatar section */}
        <section style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Avatar
              style={displayProfile.avatarStyle || 'notionists'}
              seed={displayProfile.avatarSeed || 'default'}
              size={80}
              showRing
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-navy)' }}>
                  {user?.name}
                </h2>
                {user?.isVerified && <VerifiedBadge />}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user?.email}</p>
              {displayProfile.department && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {displayProfile.department} · {displayProfile.level}L
                </p>
              )}
            </div>
          </div>

          {editSection === 'avatar' ? (
            <div style={{ marginTop: '1.5rem' }}>
              <AvatarPicker
                selected={{ style: editData.avatarStyle, seed: editData.avatarSeed }}
                onSelect={({ style, seed }) => setEditData(p => ({ ...p, avatarStyle: style, avatarSeed: seed }))}
              />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <Button variant="primary" size="md" fullWidth onClick={handleSaveSection} loading={saving}>Save</Button>
                <Button variant="ghost" size="md" onClick={() => { setEditSection(null); setEditData(profile); }}>Cancel</Button>
              </div>
            </div>
          ) : (
            <button onClick={() => { setEditSection('avatar'); setEditData(profile); }} style={editBtnStyle}>
              Change avatar
            </button>
          )}
        </section>

        {/* Intent */}
        <section style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
            <h3 style={sectionTitleStyle}>Looking for</h3>
            {editSection !== 'intent' && (
              <button onClick={() => { setEditSection('intent'); setEditData(profile); }} style={editBtnStyle}>Edit</button>
            )}
          </div>
          {editSection === 'intent' ? (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {INTENTS.map(intent => (
                  <button key={intent.id} onClick={() => setEditData(p => ({ ...p, intent: intent.id }))} style={{
                    display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${editData.intent === intent.id ? 'var(--color-navy)' : 'var(--border-light)'}`,
                    background: editData.intent === intent.id ? 'rgba(18,23,74,0.04)' : '#fff',
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    <span style={{ fontSize: '1.25rem' }}>{intent.emoji}</span>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{intent.label}</span>
                    {editData.intent === intent.id && <span style={{ marginLeft: 'auto', color: 'var(--color-navy)' }}>✓</span>}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <Button variant="primary" size="md" fullWidth onClick={handleSaveSection} loading={saving}>Save</Button>
                <Button variant="ghost" size="md" onClick={() => { setEditSection(null); setEditData(profile); }}>Cancel</Button>
              </div>
            </div>
          ) : (
            <IntentBadge intent={displayProfile.intent || 'friendship'} />
          )}
        </section>

        {/* Bio */}
        <section style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
            <h3 style={sectionTitleStyle}>About me</h3>
            {editSection !== 'bio' && (
              <button onClick={() => { setEditSection('bio'); setEditData(profile); }} style={editBtnStyle}>Edit</button>
            )}
          </div>
          {editSection === 'bio' ? (
            <div>
              <Textarea
                value={editData.bio || ''}
                onChange={e => setEditData(p => ({ ...p, bio: e.target.value }))}
                placeholder="Tell people who you are..."
                rows={5}
                maxLength={400}
              />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.875rem' }}>
                <Button variant="primary" size="md" fullWidth onClick={handleSaveSection} loading={saving}>Save</Button>
                <Button variant="ghost" size="md" onClick={() => { setEditSection(null); setEditData(profile); }}>Cancel</Button>
              </div>
            </div>
          ) : (
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {displayProfile.bio || 'No bio yet. Add one to get better matches!'}
            </p>
          )}
        </section>

        {/* Interests */}
        <section style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
            <h3 style={sectionTitleStyle}>Interests</h3>
            {editSection !== 'interests' && (
              <button onClick={() => { setEditSection('interests'); setEditData(profile); }} style={editBtnStyle}>Edit</button>
            )}
          </div>
          {editSection === 'interests' ? (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.875rem' }}>
                {INTERESTS.map(interest => {
                  const selected = (editData.interests || []).includes(interest);
                  return (
                    <button key={interest} onClick={() => toggleInterest(interest)} style={{
                      padding: '0.375rem 0.875rem', borderRadius: 'var(--radius-full)',
                      border: `2px solid ${selected ? 'var(--color-navy)' : 'var(--border-medium)'}`,
                      background: selected ? 'var(--color-navy)' : '#fff',
                      color: selected ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 500, cursor: 'pointer', fontSize: '0.8125rem',
                      transition: 'all var(--transition-fast)',
                    }}>
                      {interest}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button variant="primary" size="md" fullWidth onClick={handleSaveSection} loading={saving}>Save</Button>
                <Button variant="ghost" size="md" onClick={() => { setEditSection(null); setEditData(profile); }}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(displayProfile.interests || []).length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No interests added yet</p>
              ) : (
                (displayProfile.interests || []).map(interest => (
                  <span key={interest} style={{
                    padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)',
                    background: 'var(--color-cream-dark)', color: 'var(--text-secondary)',
                    fontSize: '0.8125rem', fontWeight: 500,
                  }}>
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
            <InfoRow label="Plan" value={user?.isPremium ? '⭐ Premium' : '✦ Free'} />
            <InfoRow label="Joined" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' }) : 'Recently'} />
            <InfoRow label="Status" value={user?.isVerified ? '✓ Verified' : 'Unverified'} />
          </div>
          {!user?.isPremium && (
            <button
              onClick={() => showToast({ message: 'Premium coming soon! 🚀', type: 'info' })}
              style={{
                marginTop: '1rem', width: '100%', padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--color-amber), #f5c553)',
                border: 'none', cursor: 'pointer',
                fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.9375rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              ⭐ Upgrade to Premium
            </button>
          )}
        </section>
      </div>

      <BottomNav />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const pageStyle = { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-elevated)' };
const sectionStyle = { background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' };
const sectionTitleStyle = { fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)' };
const editBtnStyle = { background: 'none', border: 'none', color: 'var(--color-navy)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', padding: '0.25rem 0' };
