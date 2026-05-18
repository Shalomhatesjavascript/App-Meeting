import { eq } from 'drizzle-orm'
import type { DB } from '../utils/db'
import {
  type InterestInsertDB,
  type InterestSelectDB,
  InterestsTable,
  type InterestUpdateDB,
} from './schema'

type InterestRes = Promise<InterestSelectDB | undefined>

// Helper: create an interest row (used by admin APIs). Keeping this helper
// improves testability and centralizes insertion logic.
export async function createInterest(db: DB, data: InterestInsertDB): InterestRes {
  const [inserted] = await db.insert(InterestsTable).values(data).returning()

  return inserted
}

export async function getAllInterests(db: DB): Promise<InterestSelectDB[]> {
  return db.select().from(InterestsTable)
}

export async function getInterestById(db: DB, id: number): InterestRes {
  return db.select().from(InterestsTable).where(eq(InterestsTable.id, id)).get()
}

export async function updateInterest(db: DB, id: number, data: InterestUpdateDB): InterestRes {
  const [updated] = await db
    .update(InterestsTable)
    .set({ name: data.name })
    .where(eq(InterestsTable.id, id))
    .returning()

  return updated
}

export async function deleteInterest(db: DB, id: number): Promise<void> {
  await db.delete(InterestsTable).where(eq(InterestsTable.id, id)).run()
  return
}
