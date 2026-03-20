import * as v from 'valibot'

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
  full_name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
  alias: v.pipe(v.string(), v.minLength(2), v.maxLength(50)),
  gender: v.pipe(v.string(), v.minLength(1), v.maxLength(20)),
  department: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
  level: v.number(),
  bio: v.optional(v.string()),
  intent: v.union([
    v.literal('dating'),
    v.literal('friendship'),
    v.literal('networking'),
    v.literal('study buddy'),
  ]),
  is_id_verified: v.optional(v.number()), // 0 or 1
})

/**
 * Profile update schema.
 * All fields optional except user_id (if needed for backend logic).
 */
export const ProfileUpdateSchema = v.object({
  full_name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(100))),
  alias: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(50))),
  gender: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(20))),
  department: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(100))),
  level: v.optional(v.number()),
  bio: v.optional(v.string()),
  intent: v.optional(
    v.union([
      v.literal('dating'),
      v.literal('friendship'),
      v.literal('networking'),
      v.literal('study buddy'),
    ]),
  ),
  is_id_verified: v.optional(v.number()),
})

/**
 * TypeScript types for convenience.
 */
export type ProfileCreateInput = v.InferInput<typeof ProfileCreateSchema>
export type ProfileCreateOutput = v.InferOutput<typeof ProfileCreateSchema>
export type ProfileUpdateInput = v.InferInput<typeof ProfileUpdateSchema>
export type ProfileUpdateOutput = v.InferOutput<typeof ProfileUpdateSchema>
