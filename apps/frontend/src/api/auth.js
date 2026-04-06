// ============================================
// Mock Auth API — BU Connect
// All functions simulate async API calls.
// Replace with real API calls when backend is ready.
// ============================================

const delay = (ms = 800) => new Promise(res => setTimeout(res, ms));

const STORAGE_KEY_USER = 'bu_connect_user';
const STORAGE_KEY_VERIFIED = 'bu_connect_verified';

/**
 * Simulates user registration.
 * Stores user in localStorage for persistence.
 */
export async function registerUser({ name, email, password }) {
  await delay(1000);

  // Simulate "email already exists" for demo
  const existing = localStorage.getItem(STORAGE_KEY_USER);
  if (existing) {
    const parsed = JSON.parse(existing);
    if (parsed.email === email) {
      throw new Error('An account with this email already exists.');
    }
  }

  const user = {
    id: `user_${Date.now()}`,
    name,
    email,
    createdAt: new Date().toISOString(),
    isVerified: false,
    isPremium: false,
    profileComplete: false,
  };

  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  return { user };
}

/**
 * Simulates email verification.
 * Accepts any 6-digit code for demo purposes.
 */
export async function verifyEmail({ email, code }) {
  await delay(800);

  // Accept any 6-digit code in demo mode
  if (!/^\d{6}$/.test(code)) {
    throw new Error('Invalid verification code. Please enter the 6-digit code.');
  }

  const stored = localStorage.getItem(STORAGE_KEY_USER);
  if (!stored) throw new Error('User not found.');

  const user = JSON.parse(stored);
  user.isVerified = true;
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEY_VERIFIED, 'true');

  return { user };
}

/**
 * Simulates resending the verification email.
 */
export async function resendVerificationEmail({ email }) {
  await delay(600);
  console.log(`[MOCK] Verification email resent to ${email}`);
  return { message: 'Verification email resent.' };
}

/**
 * Simulates user login.
 */
export async function loginUser({ email, password }) {
  await delay(900);

  const stored = localStorage.getItem(STORAGE_KEY_USER);

  // Create a demo user if none exists
  if (!stored) {
    throw new Error('No account found. Please register first.');
  }

  const user = JSON.parse(stored);

  if (user.email !== email) {
    throw new Error('Invalid email or password.');
  }

  // Password check skipped in mock — any password works for existing user
  return { user };
}

/**
 * Retrieves the current user from localStorage.
 */
export function getCurrentUser() {
  const stored = localStorage.getItem(STORAGE_KEY_USER);
  return stored ? JSON.parse(stored) : null;
}

/**
 * Simulates logout.
 */
export async function logoutUser() {
  await delay(300);
  // Keep user data but clear session flags if needed
  // In real app you'd clear tokens
  return { success: true };
}

/**
 * Updates user data in localStorage.
 */
export function updateStoredUser(updates) {
  const stored = localStorage.getItem(STORAGE_KEY_USER);
  if (!stored) return null;
  const user = { ...JSON.parse(stored), ...updates };
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  return user;
}
