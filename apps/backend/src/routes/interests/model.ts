import {
  type InterestCreateInput,
  InterestCreateSchema,
  type InterestUpdateInput,
  InterestUpdateSchema,
} from '@repo/shared'
import { eq } from 'drizzle-orm'
import { safeParse } from 'valibot'
import { interestsTable } from '../../db/schema'
import type { DB } from '../../db/utils'

export async function createInterest(db: DB, data: InterestCreateInput) {
  const result = safeParse(InterestCreateSchema, data)
  if (!result.success) throw result.issues
  const [inserted] = await db.insert(interestsTable).values({ name: data.name }).returning()
  return inserted
}

export async function getAllInterests(db: DB) {
  return db.select().from(interestsTable)
}

export async function getInterestById(db: DB, id: number) {
  return db.select().from(interestsTable).where(eq(interestsTable.id, id)).get()
}

export async function updateInterest(db: DB, data: InterestUpdateInput) {
  const result = safeParse(InterestUpdateSchema, data)
  if (!result.success) throw result.issues
  const [updated] = await db
    .update(interestsTable)
    .set({ name: data.name })
    .where(eq(interestsTable.id, data.id))
    .returning()
  return updated
}

export async function deleteInterest(db: DB, id: number) {
  return db.delete(interestsTable).where(eq(interestsTable.id, id)).run()
}
