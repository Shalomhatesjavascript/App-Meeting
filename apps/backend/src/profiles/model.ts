import { eq } from 'drizzle-orm'
import type { DB } from '../utils/db'
import {
  type ProfileInsertDB,
  type ProfileSelectDB,
  ProfilesTable,
  type ProfileUpdateDB,
} from './schema'

type ProfileRes = Promise<ProfileSelectDB | undefined>

/**
 * Create a new profile.
 */
export async function createProfile(db: DB, userId: string, input: ProfileInsertDB): ProfileRes {
  const resolved = { ...input, userId } as const satisfies ProfileInsertDB

  const [created] = await db
    .insert(ProfilesTable)
    .values(resolved)
    .onConflictDoUpdate({
      set: resolved,
      target: ProfilesTable.userId,
    })
    .returning()

  return created
}

/**
 * Get a profile by user_id.
 */
export async function getProfileByUserId(db: DB, userId: string): ProfileRes {
  return db.select().from(ProfilesTable).where(eq(ProfilesTable.userId, userId)).get()
}

/**
 * Update a profile by user_id.
 */
export async function updateProfile(db: DB, userId: string, input: ProfileUpdateDB) {
  const [updated] = await db
    .update(ProfilesTable)
    .set(input)
    .where(eq(ProfilesTable.userId, userId))
    .returning()

  return updated
}

/**
 * Delete a profile by user_id.
 */
export async function deleteProfile(db: DB, userId: string) {
  return db.delete(ProfilesTable).where(eq(ProfilesTable.userId, userId)).run()
}
