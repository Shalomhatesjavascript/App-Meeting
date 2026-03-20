import { eq } from 'drizzle-orm'
import { userInterestsTable } from '../../db/schema'
import type { DB } from '../../db/utils'

/**
 * Get all interests for a user.
 */
export async function getUserInterests(db: DB, userId: number) {
  return db.select().from(userInterestsTable).where(eq(userInterestsTable.user_id, userId)).all()
}

/**
 * Add an interest to a user.
 */
export async function addUserInterest(db: DB, userId: number, interestId: number) {
  return db.insert(userInterestsTable).values({
    user_id: userId,
    interest_id: interestId,
  })
}

/**
 * Remove an interest from a user.
 */
export async function removeUserInterest(db: DB, userId: number, interestId: number) {
  return db
    .delete(userInterestsTable)
    .where(eq(userInterestsTable.user_id, userId) && eq(userInterestsTable.interest_id, interestId))
    .run()
}
