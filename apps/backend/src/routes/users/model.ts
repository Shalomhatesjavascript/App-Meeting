import type { UserAdminActionInput, UserCreateInput, UserUpdateInput } from '@repo/shared'
import { and, eq, or } from 'drizzle-orm'
import { likesTable, matchesTable, messagesTable, usersTable } from '../../db/schema'
import type { DB } from '../../db/utils'

async function hashPassword(value: string): Promise<string> {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return `h_${(hash >>> 0).toString(16)}`
}

/**
 * Create a new user.
 * @param input - User creation payload (validated)
 */
export async function createUser(db: DB, input: UserCreateInput) {
  const password_hash = await hashPassword(input.password)
  const [created] = await db
    .insert(usersTable)
    .values({
      email: input.email,
      is_approved: 1,
      is_banned: 0,
      is_verified: 0,
      password_hash,
      role: input.role,
    })
    .returning()
  return created
}

/**
 * Update an existing user.
 * @param id - User ID
 * @param input - User update payload (validated)
 */
export async function updateUser(db: DB, id: number, input: UserUpdateInput) {
  const payload: Partial<typeof usersTable.$inferInsert> = {
    email: input.email,
    is_approved: input.is_approved,
    is_banned: input.is_banned,
    is_verified: input.is_verified,
    last_login_at: input.last_login_at,
    role: input.role,
  }

  if (input.password) {
    payload.password_hash = await hashPassword(input.password)
  }

  const [updated] = await db
    .update(usersTable)
    .set(payload)
    .where(eq(usersTable.id, id))
    .returning()
  return updated
}

/**
 * Get a user by ID.
 * @param id - User ID
 */
export async function getUserById(db: DB, id: number) {
  return db.select().from(usersTable).where(eq(usersTable.id, id)).get()
}

/**
 * List all users (admin only).
 */
export async function listUsers(db: DB) {
  return db.select().from(usersTable).all()
}

/**
 * Delete a user by ID.
 * @param id - User ID
 */
export async function deleteUser(db: DB, id: number) {
  return db.delete(usersTable).where(eq(usersTable.id, id)).run()
}

/**
 * Ban or approve a user (admin action).
 * @param id - User ID
 * @param action - Admin action payload (is_banned, is_approved)
 */
export async function adminActionUser(db: DB, id: number, action: UserAdminActionInput) {
  const [updated] = await db
    .update(usersTable)
    .set({
      is_approved: action.is_approved,
      is_banned: action.is_banned,
    })
    .where(eq(usersTable.id, id))
    .returning()

  return updated
}

export async function getUserStats(db: DB, id: number) {
  const [likesGiven, likesReceived, matches, messagesSent] = await Promise.all([
    db
      .select({ id: likesTable.id })
      .from(likesTable)
      .where(and(eq(likesTable.from_user_id, id), eq(likesTable.is_like, 1)))
      .all(),
    db
      .select({ id: likesTable.id })
      .from(likesTable)
      .where(and(eq(likesTable.to_user_id, id), eq(likesTable.is_like, 1)))
      .all(),
    db
      .select({ id: matchesTable.id })
      .from(matchesTable)
      .where(or(eq(matchesTable.user1_id, id), eq(matchesTable.user2_id, id)))
      .all(),
    db
      .select({ id: messagesTable.id })
      .from(messagesTable)
      .where(eq(messagesTable.sender_id, id))
      .all(),
  ])

  return {
    likesGiven: likesGiven.length,
    likesReceived: likesReceived.length,
    matches: matches.length,
    messagesSent: messagesSent.length,
  }
}
