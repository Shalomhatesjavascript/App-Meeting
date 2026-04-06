import type { MatchCreateInput } from '@repo/shared'
import { eq, or } from 'drizzle-orm'
import { matchesTable } from '../../db/schema'
import { getDrizzleDb } from '../../db/utils'

/**
 * Model functions for matches.
 * These should be implemented to interact with the database.
 */
export const createMatch = async (input: MatchCreateInput) => {
  const db = getDrizzleDb()
  const [created] = await db
    .insert(matchesTable)
    .values({
      created_at: new Date().toISOString(),
      user1_id: input.user1_id,
      user2_id: input.user2_id,
    })
    .returning()
  return created
}

export const getMatchById = async (id: number) => {
  const db = getDrizzleDb()
  return db.select().from(matchesTable).where(eq(matchesTable.id, id)).get()
}

export const listMatchesForUser = async (userId: number) => {
  const db = getDrizzleDb()
  return db
    .select()
    .from(matchesTable)
    .where(or(eq(matchesTable.user1_id, userId), eq(matchesTable.user2_id, userId)))
    .all()
}
