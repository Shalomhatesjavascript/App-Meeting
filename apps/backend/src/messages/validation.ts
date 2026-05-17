import { PositiveIntSchema } from '@repo/shared'
import { createInsertSchema, createUpdateSchema } from 'drizzle-valibot'
import * as v from 'valibot'
import { MessageTable } from './schema'

export const MessageQuerySchema = v.object({
  limit: v.optional(v.pipe(PositiveIntSchema, v.maxValue(100)), 30),
  matchId: PositiveIntSchema,
})
export type MessageQueryOutput = v.InferOutput<typeof MessageQuerySchema>

export const MessageInsertSchema = createInsertSchema(MessageTable, {
  senderId: (schema) => v.optional(schema),
})
export const MessageUpdateSchema = createUpdateSchema(MessageTable)
