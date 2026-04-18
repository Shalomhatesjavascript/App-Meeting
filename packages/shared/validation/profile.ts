import * as v from 'valibot'
import { PositiveIntSchema } from './common'

const profileIntentValues = ['dating', 'friendship', 'networking', 'study buddy'] as const

/**
 * Profile creation schema.
 * - full_name: required, 1-100 chars (admin-only, not exposed to users)
 * - alias: required, 2-50 chars (user-facing)
 * - gender: required, 1-20 chars
 * - department: required, 1-100 chars
 * - level: required, integer (100, 200, 300, 400, 500, etc)
 * - bio: optional, any length
 * - intent: required, one of allowed values
 * - is_id_verified: optional, boolean (0/1)
 */
export const ProfileCreateSchema = v.object({
  avatarSeed: v.optional(v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(100))),
  avatarStyle: v.optional(v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(50))),
  alias: v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(50)),
  bio: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(500))),
  department: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(100)),
  fullName: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(100)),
  gender: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(20)),
  intent: v.picklist(profileIntentValues),
  isIdVerified: v.optional(v.boolean()),
  level: v.pipe(PositiveIntSchema, v.minValue(100), v.maxValue(800)),
})

/**
 * Profile update schema.
 * All fields optional except user_id (if needed for backend logic).
 */
export const ProfileUpdateSchema = v.object({
  avatarSeed: v.optional(v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(100))),
  avatarStyle: v.optional(v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(50))),
  alias: v.optional(v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(50))),
  bio: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(500))),
  department: v.optional(v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(100))),
  fullName: v.optional(v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(100))),
  gender: v.optional(v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(20))),
  intent: v.optional(v.picklist(profileIntentValues)),
  isIdVerified: v.optional(v.boolean()),
  level: v.optional(v.pipe(PositiveIntSchema, v.minValue(100), v.maxValue(800))),
})

/**
 * TypeScript types for convenience.
 */
export type ProfileCreateInput = v.InferInput<typeof ProfileCreateSchema>
export type ProfileCreateOutput = v.InferOutput<typeof ProfileCreateSchema>
export type ProfileUpdateInput = v.InferInput<typeof ProfileUpdateSchema>
export type ProfileUpdateOutput = v.InferOutput<typeof ProfileUpdateSchema>
