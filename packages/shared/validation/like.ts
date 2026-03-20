import * as v from 'valibot'

/**
 * Schema for creating a like or pass action.
 * - from_user_id: ID of the user performing the action
 * - to_user_id: ID of the user being liked or passed
 * - is_like: true for like, false for pass
 */
export const LikeCreateSchema = v.object({
  from_user_id: v.number(),
  to_user_id: v.number(),
  is_like: v.boolean(),
})
export type LikeCreateInput = v.InferInput<typeof LikeCreateSchema>
export type LikeCreateOutput = v.InferOutput<typeof LikeCreateSchema>

/**
 * Schema for querying a like by ID.
 */
export const LikeIdSchema = v.object({
  id: v.number(),
})
export type LikeIdInput = v.InferInput<typeof LikeIdSchema>
export type LikeIdOutput = v.InferOutput<typeof LikeIdSchema>
