import type { LikeCreateInput } from '@repo/shared'
import type { InferModel } from 'drizzle-orm'
import { and, eq, gte, or } from 'drizzle-orm'
import { likesTable, matchesTable, subscriptionsTable, usersTable } from '../../db/schema'
import type { DB } from '../../db/utils'
import { AuthErrorCodeEnum } from '../../lib/auth-enums'
import { createRouteError } from '../../lib/route-error'

// Type for a Like row
export type Like = InferModel<typeof likesTable>

async function getWeeklyLimit(db: DB, userId: number): Promise<number> {
  const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).get()
  const nowIso = new Date().toISOString()
  const activeSubscriptions = await db
    .select()
    .from(subscriptionsTable)
    .where(and(eq(subscriptionsTable.user_id, userId), gte(subscriptionsTable.expiry_date, nowIso)))
    .all()

  const hasPaidTier =
    user?.role === 'premium' ||
    user?.role === 'admin' ||
    activeSubscriptions.some((entry) => entry.tier === 'premium' || entry.tier === 'vip')

  return hasPaidTier ? 5 : 1
}

async function countWeeklyMatches(db: DB, userId: number): Promise<number> {
  const weekStart = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  const matches = await db
    .select({ id: matchesTable.id })
    .from(matchesTable)
    .where(
      and(
        or(eq(matchesTable.user1_id, userId), eq(matchesTable.user2_id, userId)),
        gte(matchesTable.created_at, weekStart),
      ),
    )
    .all()
  return matches.length
}

async function maybeCreateMatch(db: DB, fromUserId: number, toUserId: number) {
  const [existingMatch] = await db
    .select()
    .from(matchesTable)
    .where(
      or(
        and(eq(matchesTable.user1_id, fromUserId), eq(matchesTable.user2_id, toUserId)),
        and(eq(matchesTable.user1_id, toUserId), eq(matchesTable.user2_id, fromUserId)),
      ),
    )

  if (existingMatch) {
    return { created: false, limitReached: false, match: existingMatch }
  }

  const [fromCount, toCount, fromLimit, toLimit] = await Promise.all([
    countWeeklyMatches(db, fromUserId),
    countWeeklyMatches(db, toUserId),
    getWeeklyLimit(db, fromUserId),
    getWeeklyLimit(db, toUserId),
  ])

  if (fromCount >= fromLimit || toCount >= toLimit) {
    return { created: false, limitReached: true, match: null }
  }

  const [created] = await db
    .insert(matchesTable)
    .values({
      created_at: new Date().toISOString(),
      user1_id: fromUserId,
      user2_id: toUserId,
    })
    .returning()

  return { created: true, limitReached: false, match: created }
}

/**
 * Create a like or pass action.
 * @param db - Drizzle database instance
 * @param input - LikeCreateInput (validated)
 */
export async function createLike(db: DB, input: LikeCreateInput) {
  if (input.from_user_id === input.to_user_id) {
    throw createRouteError(AuthErrorCodeEnum.VALIDATION_ERROR, 'You cannot like yourself')
  }

  const existing = await db
    .select()
    .from(likesTable)
    .where(
      and(
        eq(likesTable.from_user_id, input.from_user_id),
        eq(likesTable.to_user_id, input.to_user_id),
      ),
    )
    .get()

  let like: Like | undefined
  if (existing) {
    ;[like] = await db
      .update(likesTable)
      .set({
        created_at: new Date().toISOString(),
        is_like: input.is_like ? 1 : 0,
      })
      .where(eq(likesTable.id, existing.id))
      .returning()
  } else {
    ;[like] = await db
      .insert(likesTable)
      .values({
        created_at: new Date().toISOString(),
        from_user_id: input.from_user_id,
        is_like: input.is_like ? 1 : 0,
        to_user_id: input.to_user_id,
      })
      .returning()
  }

  if (!input.is_like || !like) {
    return { like, limitReached: false, match: null, matched: false }
  }

  const reciprocal = await db
    .select()
    .from(likesTable)
    .where(
      and(
        eq(likesTable.from_user_id, input.to_user_id),
        eq(likesTable.to_user_id, input.from_user_id),
        eq(likesTable.is_like, 1),
      ),
    )
    .get()

  if (!reciprocal) {
    return { like, limitReached: false, match: null, matched: false }
  }

  const matchResult = await maybeCreateMatch(db, input.from_user_id, input.to_user_id)

  return {
    like,
    limitReached: matchResult.limitReached,
    match: matchResult.match,
    matched: !!matchResult.match,
  }
}

/**
 * Get a like by its ID.
 * @param db - Drizzle database instance
 * @param id - Like ID
 */
export async function getLikeById(db: DB, id: number): Promise<Like | undefined> {
  const [like] = await db.select().from(likesTable).where(eq(likesTable.id, id))
  return like
}

/**
 * Get all likes for a user (sent or received).
 * @param db - Drizzle database instance
 * @param userId - User ID
 * @param type - 'sent' | 'received'
 */
export async function getLikesForUser(
  db: DB,
  userId: number,
  type: 'sent' | 'received' = 'sent',
): Promise<Like[]> {
  if (type === 'sent') {
    return db.select().from(likesTable).where(eq(likesTable.from_user_id, userId)).all()
  } else {
    return db.select().from(likesTable).where(eq(likesTable.to_user_id, userId)).all()
  }
}

/**
 * Get mutual likes (matches) for a user.
 * @param db - Drizzle database instance
 * @param userId - User ID
 */
export async function getMutualLikes(db: DB, userId: number): Promise<Like[]> {
  const sentLikes = await db
    .select()
    .from(likesTable)
    .where(and(eq(likesTable.from_user_id, userId), eq(likesTable.is_like, 1)))
    .all()

  // Find all users who liked this user
  const receivedLikes = await db
    .select()
    .from(likesTable)
    .where(and(eq(likesTable.to_user_id, userId), eq(likesTable.is_like, 1)))
    .all()

  // Find mutual likes (where userId liked them and they liked userId)
  const mutualUserIds = sentLikes
    .map((like: Like) => like.to_user_id)
    .filter((id: number) => receivedLikes.some((like: Like) => like.from_user_id === id))

  // Return all mutual like records
  return sentLikes.filter((like: Like) => mutualUserIds.includes(like.to_user_id))
}
