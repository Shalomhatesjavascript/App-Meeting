import { AuthErrorCodeEnum } from '@repo/shared'
import { and, eq, gte, or, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import { type MatchSelectDB, MatchesTable as matchesTable } from '../matches/schema'
import { createRouteError } from '../shared/route-error'
import { SubscriptionTierEnum } from '../subscriptions/enum'
import { SubscriptionsTable } from '../subscriptions/schema'
import { UserMetaRoleEnum } from '../user/enum'
import { getUserById } from '../user/model'
import type { DB } from '../utils/db'
import { type WeeklyLimitEnum, WeekyMatchLimitEnum } from './enum'
import { type LikeInsertDB, type LikeSelectDB, LikesTable } from './schema'

async function getWeeklyLimit(db: DB, userId: string): Promise<WeeklyLimitEnum> {
  const user = await getUserById(db, userId)

  if (!user) return WeekyMatchLimitEnum.Free

  const now = new Date()
  const activeSubscriptionTiers = await db
    .select({ tier: SubscriptionsTable.tier })
    .from(SubscriptionsTable)
    .where(and(eq(SubscriptionsTable.userId, userId), gte(SubscriptionsTable.expiryDate, now)))
    .all()

  const {
    meta: { role },
  } = user

  if (
    role === UserMetaRoleEnum.Premium ||
    activeSubscriptionTiers.some((sub) => sub.tier === SubscriptionTierEnum.Premium)
  )
    return WeekyMatchLimitEnum.Premium

  if (
    role === UserMetaRoleEnum.Vip ||
    role === UserMetaRoleEnum.Admin ||
    activeSubscriptionTiers.some((sub) => sub.tier === SubscriptionTierEnum.Vip)
  )
    return WeekyMatchLimitEnum.Vip

  return WeekyMatchLimitEnum.Free
}

function getWeeklyMatchesForIdQuery(db: DB, userId: string) {
  const weekStart = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)

  return db.$count(
    matchesTable,
    and(
      or(eq(matchesTable.user1Id, userId), eq(matchesTable.user2Id, userId)),
      gte(matchesTable.createdAt, weekStart),
    ),
  )
}

async function countWeeklyMatches(
  db: DB,
  fromUserId: string,
  toUserId: string,
): Promise<{ toUser: number; fromUser: number }> {
  const row = await db
    .select({
      fromUser: getWeeklyMatchesForIdQuery(db, fromUserId),
      toUser: getWeeklyMatchesForIdQuery(db, toUserId),
    })
    .from(sql`select 1`)
    .limit(1)
    .get()

  return row ?? { fromUser: 0, toUser: 0 }
}

type MaybeCreateMatchRes = Readonly<{
  /** Was a new match created? */
  created: boolean

  /** Has the user used their maximum weekly matches? */
  isLimitReached: boolean

  match: MatchSelectDB | null
}>

async function maybeCreateMatch(
  db: DB,
  fromUserId: string,
  toUserId: string,
): Promise<MaybeCreateMatchRes> {
  const [existingMatch] = await db
    .select()
    .from(matchesTable)
    .where(
      or(
        and(eq(matchesTable.user1Id, fromUserId), eq(matchesTable.user2Id, toUserId)),
        and(eq(matchesTable.user1Id, toUserId), eq(matchesTable.user2Id, fromUserId)),
      ),
    )

  if (existingMatch) {
    return { created: false, isLimitReached: false, match: existingMatch }
  }

  const [{ fromUser: fromCount, toUser: toCount }, fromLimit, toLimit] = await Promise.all([
    countWeeklyMatches(db, fromUserId, toUserId),
    getWeeklyLimit(db, fromUserId),
    getWeeklyLimit(db, toUserId),
  ])

  if (fromCount >= fromLimit || toCount >= toLimit) {
    return { created: false, isLimitReached: true, match: null }
  }

  const [created = null] = await db
    .insert(matchesTable)
    .values({
      createdAt: new Date(),
      user1Id: fromUserId,
      user2Id: toUserId,
    })
    .returning()

  return { created: true, isLimitReached: false, match: created }
}

type CreateOrUpdateLikeRes = Omit<MaybeCreateMatchRes, 'created'> & { like: LikeSelectDB | null }

export async function createOrUpdateLike(
  db: DB,
  input: LikeInsertDB,
): Promise<CreateOrUpdateLikeRes> {
  if (input.fromUserId === input.toUserId) {
    throw createRouteError(AuthErrorCodeEnum.ValidationError, 'You cannot like yourself')
  }

  const existing = await db
    .select()
    .from(LikesTable)
    .where(
      and(eq(LikesTable.fromUserId, input.fromUserId), eq(LikesTable.toUserId, input.toUserId)),
    )
    .get()

  let like: LikeSelectDB | null
  if (existing) {
    ;[like = null] = await db
      .update(LikesTable)
      .set(input)
      .where(eq(LikesTable.id, existing.id))
      .returning()
  } else {
    ;[like = null] = await db.insert(LikesTable).values(input).returning()
  }

  if (!input.isLike || !like) {
    return { isLimitReached: false, like, match: null }
  }

  const reciprocal = await db
    .select()
    .from(LikesTable)
    .where(
      and(
        eq(LikesTable.fromUserId, input.toUserId),
        eq(LikesTable.toUserId, input.fromUserId),
        eq(LikesTable.isLike, true),
      ),
    )
    .get()

  if (!reciprocal) {
    return { isLimitReached: false, like, match: null }
  }

  const matchResult = await maybeCreateMatch(db, input.fromUserId, input.toUserId)

  return {
    like,
    ...matchResult,
  }
}

/**
 * Get a like by its ID.
 * @param db - Drizzle database instance
 * @param id - Like ID
 */
export async function getLikeById(db: DB, id: number): Promise<LikeSelectDB | undefined> {
  const [like] = await db.select().from(LikesTable).where(eq(LikesTable.id, id))
  return like
}

export async function getLikesForUser(
  db: DB,
  userId: string,
  type: 'sent' | 'received' = 'sent',
): Promise<LikeSelectDB[]> {
  if (type === 'sent') {
    return db.select().from(LikesTable).where(eq(LikesTable.fromUserId, userId)).all()
  } else {
    return db.select().from(LikesTable).where(eq(LikesTable.toUserId, userId)).all()
  }
}

// TODO: revisit this later
export async function getMutualLikes(
  db: DB,
  userId: string,
): Promise<ReadonlyArray<{ fromUser: LikeSelectDB; toUser: LikeSelectDB }>> {
  const LikesTableFromUser = alias(LikesTable, 'fromUser')
  const LikesTableToUser = alias(LikesTable, 'toUser')

  return (
    db
      .select({
        fromUser: LikesTableFromUser,
        toUser: LikesTableToUser,
      })
      .from(LikesTableFromUser)
      // Self join with likes from others to the user
      .innerJoin(
        LikesTableToUser,
        and(
          eq(LikesTableToUser.fromUserId, LikesTableFromUser.toUserId),
          eq(LikesTableToUser.toUserId, userId),
          eq(LikesTableToUser.isLike, true),
        ),
      )
      // Pick out likes from the user
      .where(and(eq(LikesTableFromUser.fromUserId, userId), eq(LikesTableFromUser.isLike, true)))
      .all()
  )
}
