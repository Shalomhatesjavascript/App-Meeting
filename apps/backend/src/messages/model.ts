import { and, asc, eq, or } from 'drizzle-orm'
import { MatchesTable } from '../matches/schema'

import { db } from '../utils/db'
import { type MessageInsertDB, MessageTable } from './schema'

async function ensureMatchMember(matchId: number, userId: string): Promise<boolean> {
  const match = await db
    .select({ user1Id: MatchesTable.user1Id, user2Id: MatchesTable.user2Id })
    .from(MatchesTable)
    .where(eq(MatchesTable.id, matchId))
    .get()

  if (!match) return false
  const uid = userId
  return match.user1Id === uid || match.user2Id === uid
}

type MessageAccess = Readonly<{
  allowed: boolean
  exists: boolean
}>

async function getMessageAccess(messageId: number, userId: string): Promise<MessageAccess> {
  const uid = String(userId)
  const row = await db
    .select({
      messageId: MessageTable.id,
      user1Id: MatchesTable.user1Id,
      user2Id: MatchesTable.user2Id,
    })
    .from(MessageTable)
    .innerJoin(MatchesTable, eq(MessageTable.matchId, MatchesTable.id))
    .where(eq(MessageTable.id, messageId))
    .get()

  if (!row) {
    return { allowed: false, exists: false }
  }

  const allowed = row.user1Id === uid || row.user2Id === uid
  return { allowed, exists: true }
}

export async function canReadMessage(messageId: number, userId: string): Promise<MessageAccess> {
  return getMessageAccess(messageId, userId)
}

/**
 * Validate and create a new message.
 * @param input - Message creation payload
 */
export async function createMessage(input: MessageInsertDB) {
  const allowed = await ensureMatchMember(input.matchId, String(input.senderId))
  if (!allowed) return null

  const [created] = await db.insert(MessageTable).values(input).returning()

  return created
}

/**
 * Mark a message as read.
 * @param id - message id
 * @param userId - acting user
 */
export async function markMessageAsRead(id: number, userId?: string) {
  if (userId !== undefined) {
    const access = await getMessageAccess(id, userId)
    if (!access.allowed) {
      return null
    }
  }

  const [updated] = await db
    .update(MessageTable)
    .set({ isRead: true })
    .where(eq(MessageTable.id, id))
    .returning()

  return updated
}

export async function getMessagesForMatch({ matchId, limit }: { matchId: number; limit: number }) {
  return (
    db
      .select()
      .from(MessageTable)
      .where(eq(MessageTable.matchId, matchId))
      // Sort the messages in order of creation top-down style
      .orderBy(asc(MessageTable.createdAt))
      .limit(limit)
      .all()
  )
}

export async function canReadMatchMessages(matchId: number, userId: string): Promise<boolean> {
  const row = await db
    .select({ id: MatchesTable.id })
    .from(MatchesTable)
    .where(
      and(
        eq(MatchesTable.id, matchId),
        or(eq(MatchesTable.user1Id, String(userId)), eq(MatchesTable.user2Id, String(userId))),
      ),
    )
    .get()

  return !!row
}
