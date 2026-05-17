import { eq, or } from 'drizzle-orm'
import { db } from '../utils/db'
import { MatchesTable, type MatchInsertDB } from './schema'

export const createMatch = async (input: MatchInsertDB | any) => {
  const payload = {
    ...input,
    user1Id: String((input as any).user1Id),
    user2Id: String((input as any).user2Id),
  }
  const [created] = await db.insert(MatchesTable).values(payload).returning()
  return created
}

export const getMatchById = async (id: number) => {
  return db.select().from(MatchesTable).where(eq(MatchesTable.id, id)).get()
}

export const listMatchesForUser = async (userId: string) => {
  return db
    .select()
    .from(MatchesTable)
    .where(or(eq(MatchesTable.user1Id, userId), eq(MatchesTable.user2Id, userId)))
    .all()
}
