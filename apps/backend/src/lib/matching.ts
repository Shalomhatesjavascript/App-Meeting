import { and, eq, inArray, notInArray } from 'drizzle-orm'
import {
  interestsTable,
  likesTable,
  profilesTable,
  userInterestsTable,
  usersTable,
} from '../db/schema'
import type { DB } from '../db/utils'

export type DiscoveryCandidate = {
  userId: number
  email: string
  alias: string
  gender: string
  department: string
  level: number
  bio: string | null
  intent: string
  score: number
  sharedInterestCount: number
  interestNames: string[]
}

/**
 * Calculate matching score between current user and candidate.
 *
 * Scoring breakdown (priority order):
 * - Shared interests: +100 per shared interest (HIGHEST WEIGHT)
 * - Intent match: +50 if same intent
 * - Department match: +20 if same department
 * - Gender match: +10 if same gender (simplified, not preference-based)
 */
export function calculateScore(
  currentUser: {
    intent: string
    department: string
    gender: string
  },
  candidate: {
    intent: string
    department: string
    gender: string
  },
  sharedInterestCount: number,
): number {
  let score = 0

  // Shared interests (heaviest weight) - each shared interest = +100 points
  score += sharedInterestCount * 100

  // Intent alignment - same intent = +50 points
  if (currentUser.intent === candidate.intent) {
    score += 50
  }

  // Department match - same department = +20 points
  if (currentUser.department === candidate.department) {
    score += 20
  }

  // Gender match - same gender = +10 points (simplified for prototype)
  if (currentUser.gender === candidate.gender) {
    score += 10
  }

  return score
}

/**
 * Get discovery candidates for a user, ranked by matching score.
 *
 * Filtering:
 * - Excludes current user
 * - Excludes already-liked users (critical edge case)
 * - Only includes verified users
 * - Returns top N candidates by score (descending)
 *
 * @param db Database instance
 * @param userId Current user ID
 * @param limit Maximum results to return
 * @param offset Pagination offset
 * @returns Array of candidates sorted by score (highest first)
 */
export async function getDiscoveryCandidates(
  db: DB,
  userId: number,
  limit = 50,
  offset = 0,
): Promise<DiscoveryCandidate[]> {
  try {
    // Get current user
    const currentUser = await db.select().from(usersTable).where(eq(usersTable.id, userId)).get()

    if (!currentUser) {
      return []
    }

    // Get current user's profile (must exist to get matches)
    const currentProfile = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.user_id, userId))
      .get()

    if (!currentProfile) {
      return []
    }

    // Get current user's interests
    const currentInterests = await db
      .select({ interestId: userInterestsTable.interest_id })
      .from(userInterestsTable)
      .where(eq(userInterestsTable.user_id, userId))

    const currentInterestIds = currentInterests.map((i) => i.interestId)

    // Get users current user has already liked (CRITICAL EDGE CASE)
    const likedByUser = await db
      .select({ toUserId: likesTable.to_user_id })
      .from(likesTable)
      .where(and(eq(likesTable.from_user_id, userId), eq(likesTable.is_like, 1)))

    const likedUserIds = likedByUser.map((l) => l.toUserId)

    // Get all verified users except current and already-liked
    const candidateUsers = await db
      .select()
      .from(usersTable)
      .where(
        and(eq(usersTable.is_verified, 1), notInArray(usersTable.id, [userId, ...likedUserIds])),
      )

    if (candidateUsers.length === 0) {
      return []
    }

    const candidateIds = candidateUsers.map((u) => u.id)

    // Get profiles for all candidates
    const candidateProfiles = await db
      .select()
      .from(profilesTable)
      .where(inArray(profilesTable.user_id, candidateIds))

    // Get all interests data
    const allInterests = await db.select().from(interestsTable)
    const interestMap = new Map(allInterests.map((i) => [i.id, i.name]))

    // Get all user-interest mappings for candidates
    const userInterestMappings = await db
      .select()
      .from(userInterestsTable)
      .where(inArray(userInterestsTable.user_id, candidateIds))

    // Build map: userId -> interestIds
    const userInterestIdsMap = new Map<number, number[]>()
    for (const mapping of userInterestMappings) {
      if (!userInterestIdsMap.has(mapping.user_id)) {
        userInterestIdsMap.set(mapping.user_id, [])
      }
      const interestIds = userInterestIdsMap.get(mapping.user_id)
      if (interestIds) {
        interestIds.push(mapping.interest_id)
      }
    }

    // Calculate scores for each candidate
    const scoredCandidates: DiscoveryCandidate[] = []

    for (const candidate of candidateUsers) {
      const profile = candidateProfiles.find((p) => p.user_id === candidate.id)

      if (!profile) continue

      // Get candidate's interests
      const candidateInterestIds = userInterestIdsMap.get(candidate.id) || []

      // Calculate shared interest count
      const sharedCount = currentInterestIds.filter((id) =>
        candidateInterestIds.includes(id),
      ).length

      // Calculate score
      const score = calculateScore(
        {
          department: currentProfile.department,
          gender: currentProfile.gender,
          intent: currentProfile.intent,
        },
        {
          department: profile.department,
          gender: profile.gender,
          intent: profile.intent,
        },
        sharedCount,
      )

      // Get interest names for display
      const interestNames = candidateInterestIds
        .map((id) => interestMap.get(id))
        .filter((name) => name !== undefined) as string[]

      scoredCandidates.push({
        alias: profile.alias,
        bio: profile.bio,
        department: profile.department,
        email: candidate.email,
        gender: profile.gender,
        intent: profile.intent,
        interestNames,
        level: profile.level,
        score,
        sharedInterestCount: sharedCount,
        userId: candidate.id,
      })
    }

    // Sort by score descending (highest first), then apply pagination
    return scoredCandidates.sort((a, b) => b.score - a.score).slice(offset, offset + limit)
  } catch (error) {
    console.error('Error getting discovery candidates:', error)
    return []
  }
}
