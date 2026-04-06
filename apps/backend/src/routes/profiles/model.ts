import type { ProfileCreateInput, ProfileUpdateInput } from '@repo/shared'
import { eq } from 'drizzle-orm'
import { profilesTable } from '../../db/schema'
import type { DB } from '../../db/utils'

/**
 * Create a new profile.
 */
export async function createProfile(db: DB, user_id: number, input: ProfileCreateInput) {
  const [created] = await db
    .insert(profilesTable)
    .values({
      alias: input.alias,
      bio: input.bio,
      department: input.department,
      full_name: input.full_name,
      gender: input.gender,
      intent: input.intent,
      is_id_verified: input.is_id_verified ?? 0,
      level: input.level,
      user_id,
    })
    .onConflictDoUpdate({
      set: {
        alias: input.alias,
        bio: input.bio,
        department: input.department,
        full_name: input.full_name,
        gender: input.gender,
        intent: input.intent,
        is_id_verified: input.is_id_verified ?? 0,
        level: input.level,
      },
      target: profilesTable.user_id,
    })
    .returning()

  return created
}

/**
 * Get a profile by user_id.
 */
export async function getProfileByUserId(db: DB, user_id: number) {
  return db.select().from(profilesTable).where(eq(profilesTable.user_id, user_id)).get()
}

/**
 * Update a profile by user_id.
 */
export async function updateProfile(db: DB, user_id: number, input: ProfileUpdateInput) {
  const [updated] = await db
    .update(profilesTable)
    .set({
      alias: input.alias,
      bio: input.bio,
      department: input.department,
      full_name: input.full_name,
      gender: input.gender,
      intent: input.intent,
      is_id_verified: input.is_id_verified,
      level: input.level,
    })
    .where(eq(profilesTable.user_id, user_id))
    .returning()

  return updated
}

/**
 * Delete a profile by user_id.
 */
export async function deleteProfile(db: DB, user_id: number) {
  return db.delete(profilesTable).where(eq(profilesTable.user_id, user_id)).run()
}
