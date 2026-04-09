import * as v from 'valibot'
import { PositiveIntSchema } from './common'

/**
 * Schema for creating a new message.
 * - match_id: required, integer (match this message belongs to)
 * - sender_id: required, integer (user sending the message)
 * - content: required, string (1-2000 chars)
 */
export const MessageCreateSchema = v.object({
  content: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(2000)),
  match_id: PositiveIntSchema,
  sender_id: PositiveIntSchema,
})
export type MessageCreateInput = v.InferInput<typeof MessageCreateSchema>
export type MessageCreateOutput = v.InferOutput<typeof MessageCreateSchema>

/**
 * Schema for marking a message as read.
 * - id: required, integer (message id)
 */
export const MessageReadSchema = v.object({
  id: PositiveIntSchema,
})
export type MessageReadInput = v.InferInput<typeof MessageReadSchema>
export type MessageReadOutput = v.InferOutput<typeof MessageReadSchema>

/**
 * Schema for querying messages (e.g., for a match)
 * - match_id: required, integer
 * - before_id: optional, integer (for pagination)
 * - limit: optional, integer (max results)
 */
export const MessageQuerySchema = v.object({
  before_id: v.optional(PositiveIntSchema),
  limit: v.optional(v.pipe(PositiveIntSchema, v.maxValue(100))),
  match_id: PositiveIntSchema,
})
export type MessageQueryInput = v.InferInput<typeof MessageQuerySchema>
export type MessageQueryOutput = v.InferOutput<typeof MessageQuerySchema>
