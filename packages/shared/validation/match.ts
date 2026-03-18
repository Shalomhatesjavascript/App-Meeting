import * as v from 'valibot'

/**
 * Schema for creating a match (admin or system action).
 * Usually, matches are created when two users mutually like each other.
 */
export const MatchCreateSchema = v.object({
  user1_id: v.number(),
  user2_id: v.number(),
})
export type MatchCreateInput = v.InferInput<typeof MatchCreateSchema>
export type MatchCreateOutput = v.InferOutput<typeof MatchCreateSchema>

export const MatchIdSchema = v.object({
  id: v.number(),
})
export type MatchIdInput = v.InferInput<typeof MatchIdSchema>
export type MatchIdOutput = v.InferOutput<typeof MatchIdSchema>
