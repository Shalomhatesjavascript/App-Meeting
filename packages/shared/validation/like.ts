import * as v from 'valibot'
import { PositiveIntSchema } from './common'

/**
 * Schema for creating a like or pass action.
 * - from_user_id: ID of the user performing the action
 * - to_user_id: ID of the user being liked or passed
 * - is_like: true for like, false for pass
 */
export const LikeCreateSchema = v.object({
  from_user_id: PositiveIntSchema,
  is_like: v.boolean(),
  to_user_id: PositiveIntSchema,
})
export type LikeCreateInput = v.InferInput<typeof LikeCreateSchema>
export type LikeCreateOutput = v.InferOutput<typeof LikeCreateSchema>

/**
 * Schema for querying a like by ID.
 */
export const LikeIdSchema = v.object({
  id: PositiveIntSchema,
})
export type LikeIdInput = v.InferInput<typeof LikeIdSchema>
export type LikeIdOutput = v.InferOutput<typeof LikeIdSchema>
