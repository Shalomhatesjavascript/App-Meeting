import api from '../server/eden-treaty'
import { getAuthHeaders, getCurrentUser } from './auth'

function toDiscoverCard(profile, user) {
  const alias = profile?.alias || user?.email?.split('@')[0] || 'Student'
  return {
    avatarSeed: alias.toLowerCase().replace(/\s+/g, '-'),
    avatarStyle: 'notionists',
    bio: profile?.bio || 'Hello there!',
    department: profile?.department || 'Babcock University',
    id: String(user?.id || profile?.user_id),
    intent: profile?.intent || 'friendship',
    interests: [],
    isVerified: Boolean(profile?.is_id_verified),
    level: Number(profile?.level || 100),
    name: alias,
  }
}

async function getProfileByUserId(userId) {
  const { data } = await api.profiles({ user_id: String(userId) }).get(undefined, {
    headers: getAuthHeaders(),
  })
  return data || null
}

/**
 * Get discovery candidates from matching algorithm (recommended users).
 * This uses the new scoring-based matching endpoint instead of just all users.
 */
export async function getDiscoveryCandidates(limit = 50, offset = 0) {
  const { data, error } = await api.discovery.candidates.get(
    { limit: String(limit), offset: String(offset) },
    { headers: getAuthHeaders() },
  )

  if (error) {
    throw new Error(error.value?.error || 'Failed to load recommendations')
  }

  // Transform candidate data to discover card format
  const candidates = Array.isArray(data?.data) ? data.data : []
  return candidates.map((candidate) => ({
    avatarSeed: (candidate.alias || 'student').toLowerCase().replace(/\s+/g, '-'),
    avatarStyle: 'notionists',
    bio: candidate.bio || 'Hello there!',
    department: candidate.department,
    id: String(candidate.userId),
    intent: candidate.intent,
    interestNames: candidate.interestNames || [],
    isVerified: false, // TODO: add to candidate response if needed
    level: candidate.level,
    matchScore: candidate.score, // For debugging/display
    name: candidate.alias,
  }))
}

/**
 * Legacy function - get all users without matching algorithm.
 * Kept for backwards compatibility if needed.
 */
export async function getDiscoverUsers() {
  const current = getCurrentUser()
  const { data, error } = await api.users.get({ headers: getAuthHeaders() })
  if (error) {
    throw new Error(error.value?.error || 'Failed to load users')
  }

  const allUsers = Array.isArray(data) ? data : []
  const candidates = allUsers.filter((user) => Number(user.id) !== Number(current?.id))

  const profiles = await Promise.all(
    candidates.map(async (user) => ({
      profile: await getProfileByUserId(user.id),
      user,
    })),
  )

  return profiles
    .filter((entry) => entry.profile)
    .map((entry) => toDiscoverCard(entry.profile, entry.user))
}

export async function swipeUser({ userId, action }) {
  const current = getCurrentUser()
  if (!current?.id) {
    throw new Error('You must be logged in to swipe.')
  }

  const { data, error } = await api.likes.post(
    {
      from_user_id: Number(current.id),
      is_like: action === 'like',
      to_user_id: Number(userId),
    },
    { headers: getAuthHeaders() },
  )

  if (error) {
    throw new Error(error.value?.error || 'Failed to send swipe')
  }

  return {
    limitReached: Boolean(data?.limitReached),
    matched: Boolean(data?.matched),
    userId,
  }
}

export async function getMatches() {
  const current = getCurrentUser()
  const { data, error } = await api.matches.get({ headers: getAuthHeaders() })
  if (error) {
    throw new Error(error.value?.error || 'Failed to load matches')
  }

  const matches = Array.isArray(data) ? data : []

  const enriched = await Promise.all(
    matches.map(async (match) => {
      const otherUserId =
        Number(match.user1_id) === Number(current?.id) ? match.user2_id : match.user1_id
      const profile = await getProfileByUserId(otherUserId)
      const messages = await getMessages(match.id)
      const lastMessage = messages[messages.length - 1] || null

      return {
        id: String(match.id),
        lastMessage: lastMessage?.text || null,
        lastMessageAt: lastMessage?.timestamp || match.created_at,
        matchedAt: match.created_at,
        unread: 0,
        user: {
          avatarSeed: (profile?.alias || `student-${otherUserId}`)
            .toLowerCase()
            .replace(/\s+/g, '-'),
          avatarStyle: 'notionists',
          department: profile?.department || 'Babcock University',
          id: String(otherUserId),
          intent: profile?.intent || 'friendship',
          isVerified: Boolean(profile?.is_id_verified),
          level: profile?.level || 100,
          name: profile?.alias || `Student ${otherUserId}`,
        },
        userId: String(otherUserId),
      }
    }),
  )

  return enriched
}

export async function getMessages(matchId) {
  const { data, error } = await api.messages({ match_id: String(matchId) }).get(undefined, {
    headers: getAuthHeaders(),
  })

  if (error) {
    throw new Error(error.value?.error || 'Failed to load messages')
  }

  const current = getCurrentUser()
  const rows = Array.isArray(data) ? data : []
  return rows
    .slice()
    .reverse()
    .map((msg) => ({
      id: String(msg.id),
      senderId: Number(msg.sender_id) === Number(current?.id) ? 'current' : String(msg.sender_id),
      text: msg.content,
      timestamp: msg.created_at,
    }))
}

export async function sendMessage({ matchId, text }) {
  const current = getCurrentUser()
  const { data, error } = await api.messages.post(
    {
      content: text,
      match_id: Number(matchId),
      sender_id: Number(current?.id),
    },
    {
      headers: getAuthHeaders(),
    },
  )

  if (error) {
    throw new Error(error.value?.error || 'Failed to send message')
  }

  return {
    message: {
      id: String(data?.id),
      senderId: 'current',
      text: data?.content || text,
      timestamp: data?.created_at || new Date().toISOString(),
    },
  }
}

export function resetSwipes() {
  // Compatibility no-op: swipes are persisted server-side now.
}
