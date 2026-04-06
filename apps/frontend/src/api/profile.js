import api from '../server/eden-treaty'
import { getAuthHeaders, getCurrentUser, updateStoredUser } from './auth'

const PROFILE_KEY = 'bu_connect_profile'

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
  const { data: allInterests } = await api.interests.get({ headers: getAuthHeaders() })
  const rows = Array.isArray(allInterests) ? allInterests : []

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
  const existing = await api['user-interests']({ userId: String(userId) }).get(undefined, {
    headers: getAuthHeaders(),
  })

  const currentIds = (existing.data || []).map((entry) => entry.interest_id)
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
  if (!user?.id) {
    throw new Error('You must be logged in to save a profile')
  }

  const body = toBackendProfileInput(profileData)
  const { data, error } = await api.profiles.post(body, { headers: getAuthHeaders() })
  if (error) {
    throw new Error(error.value?.error || 'Failed to save profile')
  }

  await syncUserInterests(user.id, profileData.interests || [])

  const profile = toFrontendProfile(data, profileData.interests || [])
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  updateStoredUser({ profile, profileComplete: true })

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

  const interests = (userInterests.data || []).map((entry) => entry.name)
  const profile = toFrontendProfile(data, interests)
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  updateStoredUser({ profile, profileComplete: true })
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

  const profile = toFrontendProfile({ ...existing, ...data }, interestList)
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  updateStoredUser({ profile })

  return { profile }
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY)
}
