import { PositiveIntSchema } from '@repo/shared'
import * as v from 'valibot'

export const UserInterestBodySchema = v.object({
  interestId: PositiveIntSchema,
  userId: v.string(),
})
export type UserInterestBodyInput = v.InferInput<typeof UserInterestBodySchema>
export type UserInterestBodyOutput = v.InferOutput<typeof UserInterestBodySchema>
