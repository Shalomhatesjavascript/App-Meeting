import api from '../server/eden-treaty'

const STORAGE_KEY_USER = 'bu_connect_user'
const STORAGE_KEY_VERIFIED = 'bu_connect_verified'
const STORAGE_KEY_TOKEN = 'bu_connect_token'

function normalizeUserId(id) {
  if (typeof id === 'number' && Number.isFinite(id)) return id
  if (typeof id === 'string') {
    const numeric = Number(id)
    if (Number.isFinite(numeric)) return numeric

    const match = id.match(/\d+/)
    if (match) {
      const extracted = Number(match[0])
      if (Number.isFinite(extracted)) return extracted
    }
  }
  return null
}

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
  const id = normalizeUserId(user?.id ?? fallback.id)
  return {
    createdAt: user?.createdAt ?? fallback.createdAt ?? new Date().toISOString(),
    email: user?.email ?? fallback.email ?? '',
    id,
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

  const payload = data?.data || data || {}
  const user = normalizeUser(payload.user, {
    email,
    isVerified: false,
    name,
    profileComplete: false,
  })
  saveSession({ token: '', user })
  return { user, verificationCode: payload.verificationCode }
}

export async function verifyEmail({ email, code }) {
  const { data, error } = await api.auth.verify.post({ code, email })
  if (error) {
    throw new Error(error.value?.error || 'Verification failed')
  }

  const payload = data?.data || data || {}
  const user =
    (payload.user && normalizeUser(payload.user, payload.user)) ||
    updateStoredUser({ email, isVerified: true }) ||
    normalizeUser({ email, isVerified: true })
  saveSession({ token: payload.token || getStoredToken(), user })

  return { result: payload, user }
}

export async function resendVerificationEmail({ email }) {
  const { data, error } = await api.auth['forgot-password'].post({ email })
  if (error) {
    throw new Error(error.value?.error || 'Failed to resend code')
  }
  const payload = data?.data || data || {}
  return {
    message: 'Verification code resent.',
    verificationCode: payload.verificationCode || null,
  }
}

export async function loginUser({ email, password }) {
  const { data, error } = await api.auth.login.post({ email, password })
  if (error) {
    throw new Error(error.value?.error || 'Invalid email or password.')
  }

  const payload = data?.data || data || {}
  const user = normalizeUser(payload.user, {
    email,
    profileComplete: getCurrentUser()?.profileComplete,
  })
  saveSession({ token: payload.token || '', user })
  return { token: payload.token, user }
}

export function getCurrentUser() {
  const stored = localStorage.getItem(STORAGE_KEY_USER)
  if (!stored) return null

  const parsed = JSON.parse(stored)
  const normalized = normalizeUser(parsed, parsed)
  if (normalized.id !== parsed.id) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(normalized))
  }
  return normalized
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
  const merged = { ...stored, ...updates }
  const user = normalizeUser(merged, merged)
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
  return user
}
