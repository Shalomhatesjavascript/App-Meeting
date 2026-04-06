import * as v from 'valibot'

/**
 * Schema for user search query parameters.
 * - q: optional string (validation of required/minLength done at route level)
 * - limit: optional, positive integer
 * - offset: optional, non-negative integer
 *
 * Clamping is done at the route level, not in the schema.
 */
export const UserSearchQuerySchema = v.object({
  limit: v.optional(v.pipe(v.number(), v.minValue(1))),
  offset: v.optional(v.pipe(v.number(), v.minValue(0))),
  q: v.optional(v.pipe(v.string(), v.trim())),
})
export type UserSearchQueryInput = v.InferInput<typeof UserSearchQuerySchema>
export type UserSearchQueryOutput = v.InferOutput<typeof UserSearchQuerySchema>
