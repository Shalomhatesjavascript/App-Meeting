import { and, eq, like, ne, or } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { LikesTable } from '../likes/schema'
import { MatchesTable as matchesTable } from '../matches/schema'
import { MessageTable as messagesTable } from '../messages/schema'
import { type ProfileSelectDB, ProfilesTable } from '../profiles/schema'
import { auth } from '../utils/auth'
import { users } from '../utils/auth/schema'
import { UserMetaRoleEnum } from './enum'
import {
  type UserMetaAdminActionInsertDB,
  UserMetaTable,
  type UserSelectDB,
  type UserWithMetaSelectDB,
  type UserWithMetaUpdateDB,
} from './schema'
import type { UserEmailSignUpOutput } from './validation'

type UserResponse = Promise<UserWithMetaSelectDB | undefined>

/**
 * Create a new user.
 */
export async function createUser(
  db: DrizzleD1Database,
  input: UserEmailSignUpOutput,
): UserResponse {
  const { user } = await auth.api.signUpEmail({ body: input })

  const meta = await db.select().from(UserMetaTable).where(eq(UserMetaTable.userId, user.id)).get()

  if (!meta) throw Error("Why didn't the database hook work???")

  return {
    meta,
    user: { ...user, image: user.image ?? null },
  }
}

/**
 */
export async function updateUser(
  db: DrizzleD1Database,
  id: string,
  input: UserWithMetaUpdateDB,
): Promise<boolean> {
  const { user: userUpdateData, meta: metaUpdateData } = input

  // If user / meta isn't given, assume they're successful, otherwise default to false before the actual updates occur
  let didUpdateUser = !!userUpdateData,
    didUpdateMeta = !!metaUpdateData

  if (userUpdateData) {
    didUpdateUser = (await auth.api.updateUser({ body: userUpdateData })).status
  }

  if (metaUpdateData) {
    didUpdateMeta = !!(
      await db
        .update(UserMetaTable)
        .set(metaUpdateData)
        .where(eq(UserMetaTable.userId, id))
        .returning({ id: UserMetaTable.userId })
        .get()
    ).id
  }

  return didUpdateUser && didUpdateMeta
}

export function getAllUserDataQueryBuilder(db: DrizzleD1Database) {
  return db
    .select({ meta: UserMetaTable, user: users })
    .from(users)
    .innerJoin(UserMetaTable, eq(users.id, UserMetaTable.userId))
}

/**
 * Get a user by ID.
 * @param userId - User ID
 */
export async function getUserById(db: DrizzleD1Database, userId: string): UserResponse {
  return getAllUserDataQueryBuilder(db).where(eq(users.id, userId)).get()
}

/**
 * List all users (admin only).

 * Note: this function supports `limit`/`offset` parameters already; see the
 * function signature for usage. Consider cursor-based pagination in future
 * work for more robust large-result handling.
 */
export async function listUsers(
  db: DrizzleD1Database,
  options?: {
    requesterId?: string
    limit?: number
    offset?: number
  },
): Promise<ReadonlyArray<UserWithMetaSelectDB>> {
  const limit = options?.limit ?? 50
  const offset = options?.offset ?? 0

  const builder = getAllUserDataQueryBuilder(db).limit(limit).offset(offset)

  if (options?.requesterId) {
    return builder
      .where(
        and(
          ne(UserMetaTable.userId, options.requesterId),
          eq(UserMetaTable.isApproved, true),
          eq(UserMetaTable.isVerified, true),
          eq(UserMetaTable.isBanned, false),
        ),
      )
      .all()
  }

  return builder.all()
}

interface SearchUsersProps {
  db: DrizzleD1Database
  requesterId: string
  query: string
  limit: number
  offset: number
}

export type SearchUsersRes = Pick<
  ProfileSelectDB,
  'alias' | 'bio' | 'department' | 'gender' | 'level' | 'userId'
> &
  Pick<UserSelectDB, 'email'>

export async function searchUsers({
  db,
  limit,
  offset,
  query,
  requesterId,
}: SearchUsersProps): Promise<SearchUsersRes[]> {
  if (!query) {
    return []
  }

  const likeTerm = `%${query}%`

  return db
    .select({
      alias: ProfilesTable.alias,
      bio: ProfilesTable.bio,
      department: ProfilesTable.department,
      email: users.email,
      gender: ProfilesTable.gender,
      intent: ProfilesTable.intent,
      level: ProfilesTable.level,
      userId: users.id,
    })
    .from(ProfilesTable)
    .innerJoin(users, eq(ProfilesTable.userId, users.id))
    .innerJoin(UserMetaTable, eq(ProfilesTable.userId, UserMetaTable.userId))
    .where(
      and(
        eq(UserMetaTable.isVerified, true),
        eq(UserMetaTable.isApproved, true),
        eq(UserMetaTable.isBanned, false),
        ne(UserMetaTable.userId, requesterId),
        or(
          like(users.email, likeTerm),
          like(ProfilesTable.alias, likeTerm),
          like(ProfilesTable.fullName, likeTerm),
          like(ProfilesTable.department, likeTerm),
        ),
      ),
    )
    .limit(limit)
    .offset(offset)
    .all()
}

/**
 * Delete a user by ID.
 */
export async function deleteUser(db: DrizzleD1Database, id: string): Promise<boolean> {
  return (await db.delete(users).where(eq(users.id, id)).run()).success
}

/**
 * Ban or approve a user (admin action).
 * @param id - User ID
 * @param action - Admin action payload (is_banned, is_approved)
 */
export async function adminActionUser(
  db: DrizzleD1Database,
  id: string,
  action: UserMetaAdminActionInsertDB,
) {
  const [updated] = await db
    .update(UserMetaTable)
    .set(action)
    .where(eq(UserMetaTable.userId, id))
    .returning()

  return updated
}

type UserStats = Readonly<{
  likes: {
    given: number
    received: number
  }
  matches: number
  messages: {
    sent: number
  }
}>

export async function getUserStats(db: DrizzleD1Database, id: string): Promise<UserStats> {
  const row = await db
    .select({
      likesGiven: db.$count(
        LikesTable,
        and(eq(LikesTable.fromUserId, users.id), eq(LikesTable.isLike, true)),
      ),
      likesReceived: db.$count(
        LikesTable,
        and(eq(LikesTable.toUserId, users.id), eq(LikesTable.isLike, true)),
      ),
      matches: db.$count(
        matchesTable,
        or(eq(matchesTable.user1Id, users.id), eq(matchesTable.user2Id, users.id)),
      ),
      messagesSent: db.$count(messagesTable, eq(messagesTable.senderId, users.id)),
    })
    .from(users)
    .where(eq(users.id, id))
    .get()

  // If the user row doesn't exist, return zeros
  const likesGiven = row?.likesGiven ?? 0
  const likesReceived = row?.likesReceived ?? 0
  const matches = row?.matches ?? 0
  const messagesSent = row?.messagesSent ?? 0

  return {
    likes: { given: likesGiven, received: likesReceived },
    matches,
    messages: { sent: messagesSent },
  }
}

export async function getUserRole(db: DrizzleD1Database, id: string): Promise<UserMetaRoleEnum> {
  const roleRow = await db
    .select({ role: UserMetaTable.role })
    .from(UserMetaTable)
    .where(eq(UserMetaTable.userId, id))
    .get()

  return roleRow?.role ?? UserMetaRoleEnum.Free
}

export async function isUserAdmin(db: DrizzleD1Database, id: string): Promise<boolean> {
  return (await getUserRole(db, id)) === UserMetaRoleEnum.Admin
}

export async function isUserAdminOrSelf(
  db: DrizzleD1Database,
  idToCheck: string,
  requesterId: string,
): Promise<boolean> {
  return idToCheck === requesterId || (await isUserAdmin(db, requesterId))
}
