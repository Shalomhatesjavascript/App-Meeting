import api from '../server/eden-treaty'
import { getAuthHeaders, getCurrentUser, updateStoredUser } from './auth'

const PROFILE_KEY = 'bu_connect_profile'

function unwrapData(result) {
  return result?.data?.data || result?.data || []
}

function toBackendProfileInput(profileData, existing = {}) {
  const user = getCurrentUser()
  const displayName = user?.name || 'Student'
  return {
    alias: existing.alias || displayName.split(' ')[0] || 'Student',
    bio: profileData.bio || existing.bio || '',
    department: profileData.department || existing.department || 'Babcock University',
    full_name: existing.full_name || displayName,
    gender: profileData.gender || existing.gender || 'other',
    intent: profileData.intent || existing.intent || 'friendship',
    is_id_verified: existing.is_id_verified ? 1 : 0,
    level: Number(profileData.level || existing.level || 100),
  }
}

function toFrontendProfile(baseProfile, interests = []) {
  return {
    ...baseProfile,
    avatarSeed: (baseProfile.alias || 'student').toLowerCase().replace(/\s+/g, '-'),
    avatarStyle: 'notionists',
    interests,
  }
}

async function ensureInterestIds(names) {
  const result = await api.interests.get({ headers: getAuthHeaders() })
  const rows = Array.isArray(unwrapData(result)) ? unwrapData(result) : []

  const ids = []
  for (const name of names) {
    const existing = rows.find((entry) => entry.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      ids.push(existing.id)
    }

    // Interest creation is admin-gated on backend; silently skip missing interests for non-admin users.
  }

  return ids
}

async function syncUserInterests(userId, interestNames) {
  const ids = await ensureInterestIds(interestNames || [])
  const existingResult = await api['user-interests']({ userId: String(userId) }).get(undefined, {
    headers: getAuthHeaders(),
  })

  const existing = Array.isArray(unwrapData(existingResult)) ? unwrapData(existingResult) : []
  const currentIds = existing.map((entry) => entry.interest_id)
  const toAdd = ids.filter((id) => !currentIds.includes(id))
  const toRemove = currentIds.filter((id) => !ids.includes(id))

  await Promise.all(
    toAdd.map((interest_id) =>
      api['user-interests'].post(
        { interest_id, user_id: Number(userId) },
        { headers: getAuthHeaders() },
      ),
    ),
  )

  await Promise.all(
    toRemove.map((interest_id) =>
      api['user-interests'].delete(
        { interest_id, user_id: Number(userId) },
        { headers: getAuthHeaders() },
      ),
    ),
  )
}

export async function saveProfile(profileData) {
  const user = getCurrentUser()
  const headers = getAuthHeaders()
  if (Object.keys(headers).length === 0) {
    throw new Error('You must be logged in to save a profile')
  }

  const body = toBackendProfileInput(profileData)
  const { data, error } = await api.profiles.post(body, { headers })
  if (error) {
    throw new Error(error.value?.error || 'Failed to save profile')
  }

  const createdProfile = data?.data || data || {}
  const userId = createdProfile.user_id ?? user?.id
  if (!userId) {
    throw new Error('Failed to save profile')
  }

  await syncUserInterests(userId, profileData.interests || [])

  const profile = toFrontendProfile(createdProfile, profileData.interests || [])
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  updateStoredUser({ id: userId, profile, profileComplete: true })

  return { profile }
}

export async function getProfile() {
  const user = getCurrentUser()
  if (!user?.id) {
    return null
  }

  const [{ data, error }, userInterests] = await Promise.all([
    api.profiles.me.get(undefined, { headers: getAuthHeaders() }),
    api['user-interests']({ userId: String(user.id) }).get(undefined, {
      headers: getAuthHeaders(),
    }),
  ])

  if (error) {
    throw new Error(error.value?.error || 'Failed to fetch profile')
  }

  const interestsData = Array.isArray(unwrapData(userInterests)) ? unwrapData(userInterests) : []
  const interests = interestsData.map((entry) => entry.name)
  const profileData = data?.data || data
  const profile = toFrontendProfile(profileData, interests)
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  updateStoredUser({ id: profileData?.user_id ?? user.id, profile, profileComplete: true })
  return profile
}

export async function updateProfile(updates) {
  const user = getCurrentUser()
  if (!user?.id) {
    throw new Error('You must be logged in to update profile')
  }

  const existing = (await getProfile()) || {}
  const body = toBackendProfileInput(updates, existing)

  const { data, error } = await api.profiles({ user_id: String(user.id) }).put(body, {
    headers: getAuthHeaders(),
  })

  if (error) {
    throw new Error(error.value?.error || 'Failed to update profile')
  }

  const interestList = updates.interests || existing.interests || []
  await syncUserInterests(user.id, interestList)

  const profileData = data?.data || data
  const profile = toFrontendProfile({ ...existing, ...profileData }, interestList)
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  updateStoredUser({ id: user.id, profile, profileComplete: true })

  return { profile }
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY)
}
