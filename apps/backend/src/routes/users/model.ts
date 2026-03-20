import type { UserAdminActionInput, UserCreateInput, UserUpdateInput } from '@repo/shared'

/**
 * Create a new user.
 * @param input - User creation payload (validated)
 */
export async function createUser(_input: UserCreateInput) {
  // TODO: Implement DB insert logic
  // Example: return db.insert(usersTable).values(input).returning();
  throw new Error('Not implemented')
}

/**
 * Update an existing user.
 * @param id - User ID
 * @param input - User update payload (validated)
 */
export async function updateUser(_id: number, _input: UserUpdateInput) {
  // TODO: Implement DB update logic
  // Example: return db.update(usersTable).set(input).where(eq(usersTable.id, id)).returning();
  throw new Error('Not implemented')
}

/**
 * Get a user by ID.
 * @param id - User ID
 */
export async function getUserById(_id: number) {
  // TODO: Implement DB select logic
  // Example: return db.select().from(usersTable).where(eq(usersTable.id, id)).first();
  throw new Error('Not implemented')
}

/**
 * List all users (admin only).
 */
export async function listUsers() {
  // TODO: Implement DB select logic
  // Example: return db.select().from(usersTable).all();
  throw new Error('Not implemented')
}

/**
 * Delete a user by ID.
 * @param id - User ID
 */
export async function deleteUser(_id: number) {
  // TODO: Implement DB delete logic
  // Example: return db.delete(usersTable).where(eq(usersTable.id, id));
  throw new Error('Not implemented')
}

/**
 * Ban or approve a user (admin action).
 * @param id - User ID
 * @param action - Admin action payload (is_banned, is_approved)
 */
export async function adminActionUser(_id: number, _action: UserAdminActionInput) {
  // TODO: Implement DB update logic for admin actions
  // Example: return db.update(usersTable).set(action).where(eq(usersTable.id, id)).returning();
  throw new Error('Not implemented')
}
