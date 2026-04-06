import type { MessageCreateInput, MessageQueryInput, MessageReadInput } from '@repo/shared'
import { and, desc, eq, lt, or } from 'drizzle-orm'
import { matchesTable, messagesTable } from '../../db/schema'
import { getDrizzleDb } from '../../db/utils'

// This is a scaffold for message model logic.
// Implement DB access functions here, using Drizzle ORM and the shared Valibot schemas for validation.

async function ensureMatchMember(matchId: number, userId: number): Promise<boolean> {
  const db = getDrizzleDb()
  const match = await db.select().from(matchesTable).where(eq(matchesTable.id, matchId)).get()
  if (!match) return false
  return match.user1_id === userId || match.user2_id === userId
}

/**
 * Validate and create a new message.
 * @param input - Message creation payload
 */
export async function createMessage(input: MessageCreateInput) {
  const db = getDrizzleDb()
  const allowed = await ensureMatchMember(input.match_id, input.sender_id)
  if (!allowed) {
    throw new Error('Sender is not a participant in this match')
  }

  const [created] = await db
    .insert(messagesTable)
    .values({
      content: input.content,
      created_at: new Date().toISOString(),
      is_read: 0,
      match_id: input.match_id,
      sender_id: input.sender_id,
    })
    .returning()

  return created
}

/**
 * Mark a message as read.
 * @param input - { id: number }
 */
export async function markMessageAsRead(input: MessageReadInput) {
  const db = getDrizzleDb()
  const [updated] = await db
    .update(messagesTable)
    .set({ is_read: 1 })
    .where(eq(messagesTable.id, input.id))
    .returning()

  return updated
}

/**
 * Query messages for a match, with optional pagination.
 * @param input - { match_id: number, before_id?: number, limit?: number }
 */
export async function getMessagesForMatch(input: MessageQueryInput) {
  const db = getDrizzleDb()
  const maxLimit = 100
  const limit = Math.min(Math.max(input.limit ?? 30, 1), maxLimit)

  if (input.before_id) {
    return db
      .select()
      .from(messagesTable)
      .where(and(eq(messagesTable.match_id, input.match_id), lt(messagesTable.id, input.before_id)))
      .orderBy(desc(messagesTable.id))
      .limit(limit)
      .all()
  }

  return db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.match_id, input.match_id))
    .orderBy(desc(messagesTable.id))
    .limit(limit)
    .all()
}

export async function canReadMatchMessages(matchId: number, userId: number): Promise<boolean> {
  const db = getDrizzleDb()
  const row = await db
    .select({ id: matchesTable.id })
    .from(matchesTable)
    .where(
      and(
        eq(matchesTable.id, matchId),
        or(eq(matchesTable.user1_id, userId), eq(matchesTable.user2_id, userId)),
      ),
    )
    .get()

  return !!row
}
