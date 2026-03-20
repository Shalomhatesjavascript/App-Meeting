// ============================================
// Mock Profile API — BU Connect
// ============================================

import { updateStoredUser } from './auth';

const delay = (ms = 800) => new Promise(res => setTimeout(res, ms));
const PROFILE_KEY = 'bu_connect_profile';

/**
 * Saves the user's profile data.
 */
export async function saveProfile(profileData) {
  await delay(900);

  const profile = {
    ...profileData,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  updateStoredUser({ profileComplete: true, profile });

  return { profile };
}

/**
 * Retrieves the user's profile.
 */
export async function getProfile() {
  await delay(400);
  const stored = localStorage.getItem(PROFILE_KEY);
  return stored ? JSON.parse(stored) : null;
}

/**
 * Updates specific profile fields.
 */
export async function updateProfile(updates) {
  await delay(600);
  const stored = localStorage.getItem(PROFILE_KEY);
  const existing = stored ? JSON.parse(stored) : {};
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
  return { profile: updated };
}

/**
 * Clears profile from localStorage (for dev/testing).
 */
export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY);
}
