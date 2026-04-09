import { authClient } from '../lib/auth-client'

const STORAGE_KEY_USER = 'bu_connect_user'

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
    isVerified: Boolean(user?.isVerified ?? user?.emailVerified ?? fallback.isVerified ?? true),
    name: fallback.name || toDisplayName(user?.email ?? fallback.email ?? '', fallback.name),
    profile: fallback.profile ?? null,
    profileComplete: Boolean(fallback.profileComplete ?? user?.profileComplete),
    role,
  }
}

function saveSession({ user }) {
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
}

export function getAuthHeaders() {
  // Auth should be derived from Better Auth HttpOnly session cookies.
  // Keep this helper for call-site compatibility during migration.
  return {}
}

async function getBetterAuthSessionUser() {
  const result = await authClient.getSession()
  return result?.data?.user || null
}

export async function registerUser({ name, email, password }) {
  const { data, error } = await authClient.signUp.email({
    email,
    name,
    password,
  })

  if (error) {
    throw new Error(error.message || 'Registration failed')
  }

  const sessionUser = data?.user || (await getBetterAuthSessionUser())
  const user = normalizeUser(sessionUser, {
    email,
    isVerified: true,
    name,
    profileComplete: false,
  })
  saveSession({ user })
  return { user }
}

export async function loginUser({ email, password }) {
  const { data, error } = await authClient.signIn.email({ email, password })
  if (error) {
    throw new Error(error.message || 'Invalid email or password.')
  }

  const sessionUser = data?.user || (await getBetterAuthSessionUser())
  const user = normalizeUser(sessionUser, {
    email,
    profileComplete: getCurrentUser()?.profileComplete,
  })
  saveSession({ user })
  return { user }
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
  await authClient.signOut()
  localStorage.removeItem(STORAGE_KEY_USER)
  return { success: true }
}

export function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEY_USER)
}

export function updateStoredUser(updates) {
  const stored = getCurrentUser()
  if (!stored) return null
  const merged = { ...stored, ...updates }
  const user = normalizeUser(merged, merged)
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
  return user
}
