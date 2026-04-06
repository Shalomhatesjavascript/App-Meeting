import { and, eq } from 'drizzle-orm'
import { interestsTable, userInterestsTable } from '../../db/schema'
import type { DB } from '../../db/utils'

/**
 * Get all interests for a user.
 */
export async function getUserInterests(db: DB, userId: number) {
  return db.select().from(userInterestsTable).where(eq(userInterestsTable.user_id, userId)).all()
}

export async function getUserInterestsWithNames(db: DB, userId: number) {
  return db
    .select({
      interest_id: userInterestsTable.interest_id,
      name: interestsTable.name,
    })
    .from(userInterestsTable)
    .innerJoin(interestsTable, eq(userInterestsTable.interest_id, interestsTable.id))
    .where(eq(userInterestsTable.user_id, userId))
    .all()
}

/**
 * Add an interest to a user.
 */
export async function addUserInterest(db: DB, userId: number, interestId: number) {
  return db
    .insert(userInterestsTable)
    .values({
      interest_id: interestId,
      user_id: userId,
    })
    .onConflictDoNothing()
    .run()
}

/**
 * Remove an interest from a user.
 */
export async function removeUserInterest(db: DB, userId: number, interestId: number) {
  return db
    .delete(userInterestsTable)
    .where(
      and(eq(userInterestsTable.user_id, userId), eq(userInterestsTable.interest_id, interestId)),
    )
    .run()
}
