import type { LikeCreateInput } from '@repo/shared'
import type { InferModel } from 'drizzle-orm'
import { and, eq } from 'drizzle-orm'
import { likesTable } from '../../db/schema'
import type { DB } from '../../db/utils'

// Type for a Like row
export type Like = InferModel<typeof likesTable>

/**
 * Create a like or pass action.
 * @param db - Drizzle database instance
 * @param input - LikeCreateInput (validated)
 */
export async function createLike(db: DB, input: LikeCreateInput): Promise<Like | undefined> {
  // Assumes input is already validated with likeCreateSchema
  const [like] = await db
    .insert(likesTable)
    .values({
      from_user_id: input.from_user_id,
      to_user_id: input.to_user_id,
      is_like: input.is_like ? 1 : 0,
      created_at: new Date().toISOString(),
    })
    .returning()

  return like
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
