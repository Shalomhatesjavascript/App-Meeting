import { and, eq, inArray, notInArray } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { InterestNameEnum } from '../interests/enum'
import { InterestsTable } from '../interests/schema'
import { LikesTable } from '../likes/schema'
import { type ProfileSelectDB, ProfilesTable } from '../profiles/schema'
import { UserMetaTable } from '../user/schema'
import { UserInterestsTable } from '../user-interests/schema'
import { users } from '../utils/auth/schema'

export type DiscoveryCandidate = Readonly<{
  id: string
  name: string
  avatarSeed: ProfileSelectDB['avatarSeed']
  avatarStyle: ProfileSelectDB['avatarStyle']
  isVerified: boolean
  userId: string
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
}>

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
 * Note: current implementation favors clarity. For very large user bases this
 * implementation may require optimization to reduce DB round-trips and memory
 * pressure (for example, by streaming results or using fewer joins).
 *
 * @param db Database instance
 * @param userId Current user ID
 * @param limit Maximum results to return
 * @param offset Pagination offset
 * @returns Array of candidates sorted by score (highest first)
 */
export async function getDiscoveryCandidates(
  db: DrizzleD1Database,
  userId: string,
  limit = 50,
  offset = 0,
): Promise<DiscoveryCandidate[]> {
  try {
    // Get current user
    const currentUser = await db
      .select()
      .from(UserMetaTable)
      .where(eq(UserMetaTable.userId, userId))
      .get()

    if (!currentUser) {
      return []
    }

    // Get current user's profile (must exist to get matches)
    const currentProfile = await db
      .select()
      .from(ProfilesTable)
      .where(eq(ProfilesTable.userId, userId))
      .get()

    if (!currentProfile) {
      return []
    }

    // Get current user's interests
    const currentInterests = await db
      .select({ id: UserInterestsTable.interestId })
      .from(UserInterestsTable)
      .where(eq(UserInterestsTable.userId, userId))

    const currentInterestIds = currentInterests.map((i) => i.id)

    // Get users current user has already liked
    const likedByUser = await db
      .select({ id: LikesTable.toUserId })
      .from(LikesTable)
      .where(and(eq(LikesTable.fromUserId, userId), eq(LikesTable.isLike, true)))

    const likedUserIds = likedByUser.map((l) => l.id)

    // Get all verified users except current and already-liked
    const candidateUsers = await db
      .select({
        alias: ProfilesTable.alias,
        avatarSeed: ProfilesTable.avatarSeed,
        avatarStyle: ProfilesTable.avatarStyle,
        bio: ProfilesTable.bio,
        department: ProfilesTable.department,
        email: users.email,
        gender: ProfilesTable.gender,
        intent: ProfilesTable.intent,
        isVerified: UserMetaTable.isVerified,
        level: ProfilesTable.level,
        userId: ProfilesTable.userId,
      })
      .from(ProfilesTable)
      .innerJoin(users, eq(ProfilesTable.userId, users.id))
      .innerJoin(UserMetaTable, eq(ProfilesTable.userId, UserMetaTable.userId))
      .where(
        and(
          eq(UserMetaTable.isVerified, true),
          notInArray(UserMetaTable.userId, [userId, ...likedUserIds]),
        ),
      )

    if (candidateUsers.length === 0) {
      return []
    }

    const candidateIds = candidateUsers.map((u) => u.userId)

    const userInterestData = await db
      .select({
        interestId: UserInterestsTable.interestId,
        name: InterestsTable.name,
        userId: UserInterestsTable.userId,
      })
      .from(UserInterestsTable)
      .innerJoin(InterestsTable, eq(UserInterestsTable.interestId, InterestsTable.id))
      .where(inArray(UserInterestsTable.userId, candidateIds))

    const userInterestIdsMap = new Map<number | string, number[]>()
    const userInterestNamesMap = new Map<number | string, string[]>()

    for (const mapping of userInterestData) {
      if (!userInterestIdsMap.has(mapping.userId)) {
        userInterestIdsMap.set(mapping.userId, [])
      }
      if (!userInterestNamesMap.has(mapping.userId)) {
        userInterestNamesMap.set(mapping.userId, [])
      }

      const interestIds = userInterestIdsMap.get(mapping.userId)
      const interestNames = userInterestNamesMap.get(mapping.userId)

      if (interestIds) {
        interestIds.push(mapping.interestId)
      }
      if (interestNames) {
        interestNames.push(mapping.name as InterestNameEnum)
      }
    }

    // Calculate scores for each candidate
    const scoredCandidates: DiscoveryCandidate[] = []

    for (const candidate of candidateUsers) {
      const candidateInterestIds = userInterestIdsMap.get(candidate.userId) || []
      const sharedCount = currentInterestIds.filter((id) =>
        candidateInterestIds.includes(id),
      ).length

      const score = calculateScore(
        {
          department: currentProfile.department,
          gender: currentProfile.gender,
          intent: currentProfile.intent,
        },
        {
          department: candidate.department,
          gender: candidate.gender,
          intent: candidate.intent,
        },
        sharedCount,
      )

      const interestNames = (userInterestNamesMap.get(candidate.userId) || []) as InterestNameEnum[]

      scoredCandidates.push({
        alias: candidate.alias,
        avatarSeed: candidate.avatarSeed,
        avatarStyle: candidate.avatarStyle,
        bio: candidate.bio,
        department: candidate.department,
        email: candidate.email,
        gender: candidate.gender,
        id: candidate.userId,
        intent: candidate.intent,
        interestNames,
        isVerified: candidate.isVerified,
        level: candidate.level,
        name: candidate.alias,
        score,
        sharedInterestCount: sharedCount,
        userId: candidate.userId,
      })
    }

    // Sort by score descending (highest first), then apply pagination
    return scoredCandidates.sort((a, b) => b.score - a.score).slice(offset, offset + limit)
  } catch (error) {
    console.error('Error getting discovery candidates:', error)
    return []
  }
}
