import type { ProfileCreateInput, ProfileUpdateInput } from '@repo/shared'

/**
 * Create a new profile.
 */
export async function createProfile(_input: ProfileCreateInput) {
  // TODO: Implement DB insert using Drizzle ORM
  // Example: return await db.insert(profilesTable).values(input)
  throw new Error('Not implemented')
}

/**
 * Get a profile by user_id.
 */
export async function getProfileByUserId(_user_id: number) {
  // TODO: Implement DB select using Drizzle ORM
  throw new Error('Not implemented')
}

/**
 * Update a profile by user_id.
 */
export async function updateProfile(_user_id: number, _input: ProfileUpdateInput) {
  // TODO: Implement DB update using Drizzle ORM
  throw new Error('Not implemented')
}

/**
 * Delete a profile by user_id.
 */
export async function deleteProfile(_user_id: number) {
  // TODO: Implement DB delete using Drizzle ORM
  throw new Error('Not implemented')
}
