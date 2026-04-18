import type { SessionRole, SessionUser } from '../types'
import { authClient } from '../lib/auth-client'

const STORAGE_KEY_USER = 'bu_connect_user'
const STORAGE_KEY_PENDING_OTP = 'bu_connect_pending_otp'

type PendingOtp = Readonly<{
  email: string
  type: 'email-verification' | 'sign-in'
}>

function normalizeUserId(id: string | number | null | undefined): number | null {
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

function toDisplayName(email: string, providedName?: string | null) {
  if (providedName?.trim()) return providedName.trim()
  const localPart = email.split('@')[0] || 'Student'
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

function normalizeUser(
  user: Partial<SessionUser> & { email?: string; role?: SessionRole },
  fallback: Partial<SessionUser> & { email?: string; role?: SessionRole } = {},
): SessionUser {
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

function saveSession({ user }: { user: SessionUser }) {
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
}

function savePendingOtp(pendingOtp: PendingOtp) {
  sessionStorage.setItem(STORAGE_KEY_PENDING_OTP, JSON.stringify(pendingOtp))
}

function readPendingOtp() {
  const stored = sessionStorage.getItem(STORAGE_KEY_PENDING_OTP)
  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch {
    sessionStorage.removeItem(STORAGE_KEY_PENDING_OTP)
    return null
  }
}

function clearPendingOtp() {
  sessionStorage.removeItem(STORAGE_KEY_PENDING_OTP)
}

async function resetAuthSession() {
  try {
    await authClient.signOut()
  } catch {
    // ignore sign-out failures when there is no active session
  }

  clearStoredSession()
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

export async function registerUser({
  name,
  email,
  password,
}: Readonly<{ name: string; email: string; password: string }>) {
  const { error } = await authClient.signUp.email({
    email,
    name,
    password,
  })

  if (error) {
    throw new Error(error.message || 'Registration failed')
  }

  await resetAuthSession()
  savePendingOtp({ email, type: 'email-verification' })

  return { email, name, requiresVerification: true }
}

export async function sendSignInCode({ email }: Readonly<{ email: string }>) {
  const { error } = await authClient.emailOtp.sendVerificationOtp({
    email,
    type: 'sign-in',
  })

  if (error) {
    throw new Error(error.message || 'Failed to send sign-in code')
  }

  savePendingOtp({ email, type: 'sign-in' })

  return { email, requiresOtp: true }
}

export async function resendVerificationCode({ email }: Readonly<{ email: string }>) {
  const { error } = await authClient.emailOtp.sendVerificationOtp({
    email,
    type: 'email-verification',
  })

  if (error) {
    throw new Error(error.message || 'Failed to send verification code')
  }

  savePendingOtp({ email, type: 'email-verification' })

  return { email, requiresOtp: true }
}

export async function verifySignInCode({ email, otp }: Readonly<{ email: string; otp: string }>) {
  const { data, error } = await authClient.signIn.emailOtp({ email, otp })

  if (error) {
    throw new Error(error.message || 'Invalid verification code')
  }

  const sessionUser = data?.user || (await getBetterAuthSessionUser())
  if (!sessionUser) {
    throw new Error('Sign in succeeded but no session was returned')
  }

  const user = normalizeUser(sessionUser, {
    email,
    profileComplete: getCurrentUser()?.profileComplete,
  })
  saveSession({ user })
  clearPendingOtp()
  return { user }
}

export async function verifyEmailCode({ email, otp }: Readonly<{ email: string; otp: string }>) {
  const { data, error } = await authClient.emailOtp.verifyEmail({ email, otp })

  if (error) {
    throw new Error(error.message || 'Invalid verification code')
  }

  const sessionUser = data?.user || (await getBetterAuthSessionUser())
  if (!sessionUser) {
    throw new Error('Verification succeeded but no session was returned')
  }

  const user = normalizeUser(sessionUser, {
    email,
    isVerified: true,
  })
  saveSession({ user })
  clearPendingOtp()
  return { user }
}

export function getPendingOtp() {
  return readPendingOtp()
}

export function getCurrentUser() {
  const stored = localStorage.getItem(STORAGE_KEY_USER)
  if (!stored) return null

  const parsed = JSON.parse(stored) as Partial<SessionUser> & { email?: string; role?: SessionRole }
  const normalized = normalizeUser(parsed, parsed)
  if (normalized.id !== parsed.id) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(normalized))
  }
  return normalized
}

export async function logoutUser() {
  await resetAuthSession()
  clearPendingOtp()
  localStorage.removeItem(STORAGE_KEY_USER)
  return { success: true }
}

export function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEY_USER)
}

export function updateStoredUser(updates: Partial<SessionUser>) {
  const stored = getCurrentUser()
  if (!stored) return null
  const merged = { ...stored, ...updates }
  const user = normalizeUser(merged, merged)
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
  return user
}
