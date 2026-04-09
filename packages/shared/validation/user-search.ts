import * as v from 'valibot'
import { NonNegativeIntSchema, PositiveIntSchema } from './common'

/**
 * Schema for user search query parameters.
 * - q: optional string (validation of required/minLength done at route level)
 * - limit: optional, positive integer
 * - offset: optional, non-negative integer
 *
 * Clamping is done at the route level, not in the schema.
 */
export const UserSearchQuerySchema = v.object({
  limit: v.optional(PositiveIntSchema),
  offset: v.optional(NonNegativeIntSchema),
  q: v.optional(v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(100))),
})
export type UserSearchQueryInput = v.InferInput<typeof UserSearchQuerySchema>
export type UserSearchQueryOutput = v.InferOutput<typeof UserSearchQuerySchema>
