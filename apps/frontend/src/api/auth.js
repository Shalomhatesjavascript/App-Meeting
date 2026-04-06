import api from '../server/eden-treaty'

const STORAGE_KEY_USER = 'bu_connect_user'
const STORAGE_KEY_VERIFIED = 'bu_connect_verified'
const STORAGE_KEY_TOKEN = 'bu_connect_token'

function toDisplayName(email, providedName) {
  if (providedName?.trim()) return providedName.trim()
  const localPart = email.split('@')[0] || 'Student'
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

function normalizeUser(user, fallback = {}) {
  const role = user?.role || fallback.role || 'free'
  return {
    createdAt: user?.createdAt ?? fallback.createdAt ?? new Date().toISOString(),
    email: user?.email ?? fallback.email ?? '',
    id: user?.id ?? fallback.id ?? null,
    isPremium: role === 'premium' || role === 'admin',
    isVerified: Boolean(user?.isVerified ?? fallback.isVerified),
    name: fallback.name || toDisplayName(user?.email ?? fallback.email ?? '', fallback.name),
    profile: fallback.profile ?? null,
    profileComplete: Boolean(fallback.profileComplete ?? user?.profileComplete),
    role,
  }
}

function saveSession({ token, user }) {
  if (token) localStorage.setItem(STORAGE_KEY_TOKEN, token)
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
  if (user.isVerified) localStorage.setItem(STORAGE_KEY_VERIFIED, 'true')
}

function getStoredToken() {
  return localStorage.getItem(STORAGE_KEY_TOKEN) || ''
}

export function getAuthHeaders() {
  const user = getCurrentUser()
  const token = getStoredToken()
  if (!user && !token) return {}
  return {
    ...(token ? { authorization: `Bearer ${token}` } : {}),
    ...(user?.id ? { 'x-user-id': String(user.id) } : {}),
    ...(user?.role ? { 'x-user-role': String(user.role) } : {}),
    ...(user?.email ? { 'x-user-email': String(user.email) } : {}),
  }
}

export async function registerUser({ name, email, password }) {
  const { data, error } = await api.auth.register.post({
    confirmPassword: password,
    email,
    password,
  })

  if (error) {
    throw new Error(error.value?.error || 'Registration failed')
  }

  const user = normalizeUser(data?.user, {
    email,
    isVerified: false,
    name,
    profileComplete: false,
  })
  saveSession({ token: '', user })
  return { user, verificationCode: data?.verificationCode }
}

export async function verifyEmail({ email, code }) {
  const { data, error } = await api.auth.verify.post({ code, email })
  if (error) {
    throw new Error(error.value?.error || 'Verification failed')
  }

  const existing = getCurrentUser() || {}
  const user = normalizeUser(existing, { ...existing, email, isVerified: true })
  saveSession({ token: getStoredToken(), user })

  return { result: data, user }
}

export async function resendVerificationEmail({ email }) {
  const { error } = await api.auth.forgotPassword.post({ email })
  if (error) {
    throw new Error(error.value?.error || 'Failed to resend code')
  }
  return { message: 'Verification code resent.' }
}

export async function loginUser({ email, password }) {
  const { data, error } = await api.auth.login.post({ email, password })
  if (error) {
    throw new Error(error.value?.error || 'Invalid email or password.')
  }

  const user = normalizeUser(data?.user, {
    email,
    profileComplete: getCurrentUser()?.profileComplete,
  })
  saveSession({ token: data?.token || '', user })
  return { token: data?.token, user }
}

export function getCurrentUser() {
  const stored = localStorage.getItem(STORAGE_KEY_USER)
  return stored ? JSON.parse(stored) : null
}

export async function logoutUser() {
  await api.auth.logout.post({}, { headers: getAuthHeaders() })
  localStorage.removeItem(STORAGE_KEY_TOKEN)
  localStorage.removeItem(STORAGE_KEY_USER)
  localStorage.removeItem(STORAGE_KEY_VERIFIED)
  return { success: true }
}

export function updateStoredUser(updates) {
  const stored = getCurrentUser()
  if (!stored) return null
  const user = normalizeUser(stored, { ...stored, ...updates })
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
  return user
}
