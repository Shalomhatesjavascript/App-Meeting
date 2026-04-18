import { and, eq } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { InterestNameEnum } from '../interests/enum'
import { InterestsTable } from '../interests/schema'
import { type UserInterestInsertDB, UserInterestsTable } from './schema'

// /**
//  * Get all interests for a user.
//  */
// export async function getUserInterests(
//   db: DrizzleD1Database,
//   userId: string,
// ): Promise<ReadonlyArray<UserInterestSelectDB>> {
//   return db.select().from(UserInterestsTable).where(eq(UserInterestsTable.userId, userId)).all()
// }

export async function getUserInterestsWithNames(
  db: DrizzleD1Database,
  userId: string,
): Promise<ReadonlyArray<{ interestId: number; name: InterestNameEnum }>> {
  return db
    .select({
      interestId: UserInterestsTable.interestId,
      name: InterestsTable.name,
    })
    .from(UserInterestsTable)
    .innerJoin(InterestsTable, eq(UserInterestsTable.interestId, InterestsTable.id))
    .where(eq(UserInterestsTable.userId, userId))
    .all()
}

/**
 * Add an interest to a user.
 */
export async function addUserInterest(db: DrizzleD1Database, interest: UserInterestInsertDB) {
  return db.insert(UserInterestsTable).values(interest).onConflictDoNothing().run()
}

/**
 * Remove an interest from a user.
 */
export async function removeUserInterest(db: DrizzleD1Database, interest: UserInterestInsertDB) {
  return db
    .delete(UserInterestsTable)
    .where(
      and(
        eq(UserInterestsTable.userId, interest.userId),
        eq(UserInterestsTable.interestId, interest.interestId),
      ),
    )
    .run()
}
