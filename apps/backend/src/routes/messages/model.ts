import type { MessageCreateInput, MessageQueryInput, MessageReadInput } from '@repo/shared'

// This is a scaffold for message model logic.
// Implement DB access functions here, using Drizzle ORM and the shared Valibot schemas for validation.

/**
 * Validate and create a new message.
 * @param input - Message creation payload
 */
export async function createMessage(input: MessageCreateInput) {
  // TODO: Insert into messagesTable using Drizzle ORM
  // Example:
  // await db.insert(messagesTable).values(input);

  return input
}

/**
 * Mark a message as read.
 * @param input - { id: number }
 */
export async function markMessageAsRead(input: MessageReadInput) {
  // TODO: Update messagesTable where id = input.id, set is_read = 1

  return input
}

/**
 * Query messages for a match, with optional pagination.
 * @param input - { match_id: number, before_id?: number, limit?: number }
 */
export async function getMessagesForMatch(input: MessageQueryInput) {
  // TODO: Query messagesTable for messages matching match_id, apply pagination if needed

  return input
}
