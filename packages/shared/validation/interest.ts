import * as v from 'valibot'

/**
 * Schema for creating a new interest.
 * - name: required, 1-50 chars, unique (enforced at DB level)
 */
export const InterestCreateSchema = v.object({
  name: v.pipe(
    v.string(),
    v.minLength(1, 'Interest name is required'),
    v.maxLength(50, 'Interest name must be at most 50 characters'),
  ),
})

/**
 * Schema for updating an interest.
 * - id: required, numeric
 * - name: required, 1-50 chars
 */
export const InterestUpdateSchema = v.object({
  id: v.number(),
  name: v.pipe(
    v.string(),
    v.minLength(1, 'Interest name is required'),
    v.maxLength(50, 'Interest name must be at most 50 characters'),
  ),
})

export type InterestCreateInput = v.InferInput<typeof InterestCreateSchema>
export type InterestCreateOutput = v.InferOutput<typeof InterestCreateSchema>
export type InterestUpdateInput = v.InferInput<typeof InterestUpdateSchema>
export type InterestUpdateOutput = v.InferOutput<typeof InterestUpdateSchema>
