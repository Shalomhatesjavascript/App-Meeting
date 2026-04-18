import { frontendEnv } from '../env'
import type { ChatMessage, DiscoverCard, MatchCard } from '../types'
import { getCurrentUser } from './auth'

type DiscoveryCandidateResponse = Readonly<{
  alias: string
  bio: string | null
  department: string
  intent: string
  interestNames: string[]
  level: number
  score: number
  userId: string
}>

type UserListRow = Readonly<{ email: string; id: string }>

type ProfileLookup = Readonly<{
  alias: string
  avatarSeed?: string
  avatarStyle?: string
  bio: string | null
  department: string
  intent: string
  isIdVerified: boolean
  level: number
  userId: string
}>

type MatchRow = Readonly<{
  createdAt: string
  id: number
  user1Id: string
  user2Id: string
}>

type MessageRow = Readonly<{
  content: string
  createdAt: string
  id: number
  senderId: string
}>

const API_BASE = `${frontendEnv.VITE_BACKEND_URL}/api`

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
    const errorMessage =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : 'Request failed'
    throw new Error(errorMessage)
  }

  return payload
}

function isDiscoveryCandidate(value: unknown): value is DiscoveryCandidateResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'alias' in value &&
    'department' in value &&
    'intent' in value &&
    'level' in value &&
    'score' in value &&
    'userId' in value
  )
}

function isUserListRow(value: unknown): value is UserListRow {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'email' in value &&
    typeof value.email === 'string'
  )
}

function isProfileLookup(value: unknown): value is ProfileLookup {
  return (
    typeof value === 'object' &&
    value !== null &&
    'alias' in value &&
    'department' in value &&
    'intent' in value &&
    'level' in value &&
    'userId' in value
  )
}

function isMatchRow(value: unknown): value is MatchRow {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'user1Id' in value &&
    'user2Id' in value &&
    'createdAt' in value
  )
}

function isMessageRow(value: unknown): value is MessageRow {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'senderId' in value &&
    'content' in value &&
    'createdAt' in value
  )
}

function toDiscoverCard(
  profile: ProfileLookup,
  user?: Readonly<{ email?: string; id?: string | number | null }>,
): DiscoverCard {
  const alias = profile.alias || user?.email?.split('@')[0] || 'Student'
  return {
    avatarSeed: profile.avatarSeed || alias.toLowerCase().replace(/\s+/g, '-'),
    avatarStyle: profile.avatarStyle || 'notionists',
    bio: profile.bio || 'Hello there!',
    department: profile.department || 'Babcock University',
    id: String(user?.id || profile.userId || ''),
    intent: profile.intent || 'friendship',
    interestNames: [],
    isVerified: Boolean(profile.isIdVerified),
    level: Number(profile.level || 100),
    name: alias,
  }
}

async function getProfileByUserId(userId: string | number): Promise<ProfileLookup | null> {
  const payload = await requestJson(`/profiles/${userId}`)
  return isProfileLookup(payload) ? payload : null
}

export async function getDiscoveryCandidates(limit = 50, offset = 0): Promise<DiscoverCard[]> {
  const payload = await requestJson(`/discovery/candidates?limit=${limit}&offset=${offset}`)
  const rows = Array.isArray(payload) ? payload.filter(isDiscoveryCandidate) : []

  return rows.map((candidate) => ({
    avatarSeed: candidate.alias.toLowerCase().replace(/\s+/g, '-'),
    avatarStyle: 'notionists',
    bio: candidate.bio || 'Hello there!',
    department: candidate.department,
    id: candidate.userId,
    intent: candidate.intent,
    interestNames: candidate.interestNames || [],
    isVerified: false,
    level: candidate.level,
    matchScore: candidate.score,
    name: candidate.alias,
  }))
}

export async function getDiscoverUsers(): Promise<DiscoverCard[]> {
  const current = getCurrentUser()
  const payload = await requestJson('/users')
  const allUsers = Array.isArray(payload) ? payload.filter(isUserListRow) : []
  const candidates = allUsers.filter((user) => Number(user.id) !== Number(current?.id))

  const profiles = await Promise.all(
    candidates.map(async (user) => ({
      profile: await getProfileByUserId(user.id),
      user,
    })),
  )

  const discoverCards: DiscoverCard[] = []
  for (const entry of profiles) {
    if (entry.profile) {
      discoverCards.push(toDiscoverCard(entry.profile, entry.user))
    }
  }

  return discoverCards
}

export async function swipeUser({
  userId,
  action,
}: Readonly<{ action: 'like' | 'pass'; userId: string | number }>) {
  const current = getCurrentUser()
  if (!current?.id) {
    throw new Error('You must be logged in to swipe.')
  }

  const payload = await requestJson('/likes', {
    body: JSON.stringify({
      fromUserId: String(current.id),
      isLike: action === 'like',
      toUserId: String(userId),
    }),
    method: 'POST',
  })

  const matched =
    typeof payload === 'object' &&
    payload !== null &&
    'matched' in payload &&
    payload.matched === true
  const limitReached =
    typeof payload === 'object' &&
    payload !== null &&
    'limitReached' in payload &&
    payload.limitReached === true

  return {
    limitReached,
    matched,
    userId,
  }
}

export async function getMatches(): Promise<MatchCard[]> {
  const current = getCurrentUser()
  const payload = await requestJson('/matches')
  const rows =
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload &&
    Array.isArray(payload.data)
      ? payload.data.filter(isMatchRow)
      : []

  const enriched = await Promise.all(
    rows.map(async (match) => {
      const otherUserId =
        Number(match.user1Id) === Number(current?.id) ? match.user2Id : match.user1Id
      const profile = await getProfileByUserId(otherUserId)
      const messages = await getMessages(match.id)
      const lastMessage = messages[messages.length - 1] || null

      return {
        id: String(match.id),
        lastMessage: lastMessage?.text || null,
        lastMessageAt: lastMessage?.timestamp || match.createdAt,
        matchedAt: match.createdAt,
        unread: 0,
        user: {
          avatarSeed:
            profile?.avatarSeed ||
            (profile?.alias || `student-${otherUserId}`).toLowerCase().replace(/\s+/g, '-'),
          avatarStyle: profile?.avatarStyle || 'notionists',
          department: profile?.department || 'Babcock University',
          id: String(otherUserId),
          intent: profile?.intent || 'friendship',
          isVerified: Boolean(profile?.isIdVerified),
          level: profile?.level || 100,
          name: profile?.alias || `Student ${otherUserId}`,
        },
        userId: String(otherUserId),
      }
    }),
  )

  return enriched
}

export async function getMessages(matchId: string | number): Promise<ChatMessage[]> {
  const payload = await requestJson(`/messages/${matchId}?limit=100`)
  const rows = Array.isArray(payload) ? payload.filter(isMessageRow) : []
  const current = getCurrentUser()

  return rows
    .slice()
    .reverse()
    .map((msg) => ({
      id: String(msg.id),
      senderId: Number(msg.senderId) === Number(current?.id) ? 'current' : String(msg.senderId),
      text: msg.content,
      timestamp: msg.createdAt,
    }))
}

export async function sendMessage({
  matchId,
  text,
}: Readonly<{ matchId: string | number; text: string }>): Promise<{ message: ChatMessage }> {
  const current = getCurrentUser()
  const payload = await requestJson('/messages', {
    body: JSON.stringify({
      content: text,
      matchId: Number(matchId),
      senderId: String(current?.id || ''),
    }),
    method: 'POST',
  })

  if (!isMessageRow(payload)) {
    throw new Error('Failed to send message')
  }

  return {
    message: {
      id: String(payload.id),
      senderId: 'current',
      text: payload.content,
      timestamp: payload.createdAt,
    },
  }
}

export function resetSwipes() {
  // Compatibility no-op: swipes are persisted server-side now.
}
