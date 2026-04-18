import { frontendEnv } from '../env'
import type { FrontendProfile, ProfileFormValues, ProfileUpdateValues } from '../types'
import { getCurrentUser, updateStoredUser } from './auth'

const PROFILE_KEY = 'bu_connect_profile'
const API_BASE = `${frontendEnv.VITE_BACKEND_URL}/api`

type InterestRow = Readonly<{ id: number; name: string }>
type UserInterestRow = Readonly<{ interestId: number; name: string }>

type BackendProfile = Readonly<{
  alias: string
  avatarSeed?: string
  avatarStyle?: string
  bio?: string | null
  department: string
  fullName?: string
  gender: string
  intent: string
  isIdVerified?: boolean
  level: number
  userId: string
}>

async function requestJson(path: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  })

  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : 'Request failed'
    throw new Error(message)
  }

  return payload
}

function isInterestRow(value: unknown): value is InterestRow {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    'name' in value &&
    typeof value.name === 'string'
  )
}

function isUserInterestRow(value: unknown): value is UserInterestRow {
  return (
    typeof value === 'object' &&
    value !== null &&
    'interestId' in value &&
    typeof value.interestId === 'number' &&
    'name' in value &&
    typeof value.name === 'string'
  )
}

function isBackendProfile(value: unknown): value is BackendProfile {
  return (
    typeof value === 'object' &&
    value !== null &&
    'alias' in value &&
    'department' in value &&
    'gender' in value &&
    'intent' in value &&
    'level' in value &&
    'userId' in value
  )
}

function normalizeGender(value: string): string {
  const lower = value.toLowerCase()
  if (lower === 'male' || lower === 'female' || lower === 'other') return lower
  return 'other'
}

function normalizeIntent(value: string): string {
  const lower = value.toLowerCase()
  if (
    lower === 'dating' ||
    lower === 'friendship' ||
    lower === 'networking' ||
    lower === 'study buddy'
  ) {
    return lower
  }
  if (lower === 'studying') return 'study buddy'
  return 'friendship'
}

function toFrontendProfile(baseProfile: BackendProfile, interests: string[] = []): FrontendProfile {
  return {
    alias: baseProfile.alias,
    avatarSeed: baseProfile.avatarSeed || baseProfile.alias.toLowerCase().replace(/\s+/g, '-'),
    avatarStyle: baseProfile.avatarStyle || 'notionists',
    bio: baseProfile.bio || '',
    department: baseProfile.department,
    fullName: baseProfile.fullName || baseProfile.alias,
    gender: normalizeGender(baseProfile.gender),
    intent: normalizeIntent(baseProfile.intent),
    interests,
    isIdVerified: Boolean(baseProfile.isIdVerified),
    level: Number(baseProfile.level || 100),
    userId: baseProfile.userId,
  }
}

function toBackendProfileInput(
  profileData: ProfileFormValues | ProfileUpdateValues,
  existing: Partial<FrontendProfile> = {},
) {
  const user = getCurrentUser()
  const displayName = user?.name || 'Student'

  return {
    alias: profileData.alias || existing.alias || displayName.split(' ')[0] || 'Student',
    avatarSeed: profileData.avatarSeed || existing.avatarSeed || 'default',
    avatarStyle: profileData.avatarStyle || existing.avatarStyle || 'notionists',
    bio: profileData.bio || existing.bio || '',
    department: profileData.department || existing.department || 'Babcock University',
    fullName: profileData.fullName || existing.fullName || displayName,
    gender: profileData.gender || existing.gender || 'other',
    intent: profileData.intent || existing.intent || 'friendship',
    isIdVerified: profileData.isIdVerified ?? Boolean(existing.isIdVerified),
    level: Number(profileData.level ?? existing.level ?? 100),
  }
}

async function ensureInterestIds(names: readonly string[]): Promise<number[]> {
  const payload = await requestJson('/interests')
  const rows = Array.isArray(payload) ? payload.filter(isInterestRow) : []

  const ids: number[] = []
  for (const name of names) {
    const existing = rows.find((entry) => entry.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      ids.push(existing.id)
    }
  }

  return ids
}

async function syncUserInterests(userId: string | number, interestNames: readonly string[]) {
  const ids = await ensureInterestIds(interestNames)
  const existingPayload = await requestJson(`/user-interests/${userId}`)
  const existingRows = Array.isArray(existingPayload)
    ? existingPayload.filter(isUserInterestRow)
    : []

  const currentIds = existingRows.map((entry) => entry.interestId)
  const toAdd = ids.filter((id) => !currentIds.includes(id))
  const toRemove = currentIds.filter((id) => !ids.includes(id))

  await Promise.all(
    toAdd.map((interestId) =>
      requestJson('/user-interests', {
        body: JSON.stringify({ interestId, userId: String(userId) }),
        method: 'POST',
      }),
    ),
  )

  await Promise.all(
    toRemove.map((interestId) =>
      requestJson('/user-interests', {
        body: JSON.stringify({ interestId, userId: String(userId) }),
        method: 'DELETE',
      }),
    ),
  )
}

export async function saveProfile(
  profileData: ProfileFormValues,
): Promise<{ profile: FrontendProfile }> {
  const user = getCurrentUser()
  if (!user?.id) {
    throw new Error('You must be logged in to save a profile')
  }

  const payload = await requestJson('/profiles', {
    body: JSON.stringify(toBackendProfileInput(profileData)),
    method: 'POST',
  })

  if (!isBackendProfile(payload)) {
    throw new Error('Failed to save profile')
  }

  const userId = payload.userId || String(user.id)
  await syncUserInterests(userId, profileData.interests || [])

  const profile = toFrontendProfile(payload, profileData.interests || [])
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  updateStoredUser({ id: userId, profile, profileComplete: true })

  return { profile }
}

export async function getProfile(): Promise<FrontendProfile | null> {
  const user = getCurrentUser()
  if (!user?.id) {
    return null
  }

  const [profilePayload, interestsPayload] = await Promise.all([
    requestJson('/profiles/me'),
    requestJson(`/user-interests/${user.id}`),
  ])

  if (!isBackendProfile(profilePayload)) {
    throw new Error('Failed to fetch profile')
  }

  const interestsRows = Array.isArray(interestsPayload)
    ? interestsPayload.filter(isUserInterestRow)
    : []
  const interests = interestsRows.map((entry) => entry.name)

  const profile = toFrontendProfile(profilePayload, interests)
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  updateStoredUser({ id: profile.userId || String(user.id), profile, profileComplete: true })

  return profile
}

export async function updateProfile(
  updates: ProfileUpdateValues,
): Promise<{ profile: FrontendProfile }> {
  const user = getCurrentUser()
  if (!user?.id) {
    throw new Error('You must be logged in to update profile')
  }

  const existing = await getProfile()
  const payload = await requestJson(`/profiles/${user.id}`, {
    body: JSON.stringify(toBackendProfileInput(updates, existing || {})),
    method: 'PUT',
  })

  if (!isBackendProfile(payload)) {
    throw new Error('Failed to update profile')
  }

  const interestList = updates.interests || existing?.interests || []
  await syncUserInterests(user.id, interestList)

  const profile = toFrontendProfile(payload, interestList)
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  updateStoredUser({ id: String(user.id), profile, profileComplete: true })

  return { profile }
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY)
}
