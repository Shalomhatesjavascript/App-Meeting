// import * as v from 'valibot'
// import { PositiveIntSchema } from './common'

// /**
//  * Schema for creating a match (admin or system action).
//  * Usually, matches are created when two users mutually like each other.
//  */
// export const MatchCreateSchema = v.object({
//   user1_id: PositiveIntSchema,
//   user2_id: PositiveIntSchema,
// })
// export type MatchCreateInput = v.InferInput<typeof MatchCreateSchema>
// export type MatchCreateOutput = v.InferOutput<typeof MatchCreateSchema>

// export const MatchIdSchema = v.object({
//   id: PositiveIntSchema,
// })
// export type MatchIdInput = v.InferInput<typeof MatchIdSchema>
// export type MatchIdOutput = v.InferOutput<typeof MatchIdSchema>
