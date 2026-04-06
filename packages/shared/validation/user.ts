import * as v from 'valibot'

const userRoleValues = ['free', 'premium', 'admin'] as const

// Email must end with @student.babcock.edu.ng or @babcock.edu.ng
const babcockEmailRegex = /^[a-zA-Z0-9._%+-]+@(student\.)?babcock\.edu\.ng$/

export const UserCreateSchema = v.object({
  email: v.pipe(
    v.string(),
    v.email(),
    v.regex(babcockEmailRegex, 'Email must be a Babcock email address'),
  ),
  password: v.pipe(v.string(), v.minLength(8, 'Password must be at least 8 characters')),
  role: v.picklist(userRoleValues),
})
export type UserCreateInput = v.InferInput<typeof UserCreateSchema>
export type UserCreateOutput = v.InferOutput<typeof UserCreateSchema>

export const UserUpdateSchema = v.object({
  email: v.optional(
    v.pipe(
      v.string(),
      v.email(),
      v.regex(babcockEmailRegex, 'Email must be a Babcock email address'),
    ),
  ),
  is_approved: v.optional(v.union([v.literal(0), v.literal(1)])),
  is_banned: v.optional(v.union([v.literal(0), v.literal(1)])),
  is_verified: v.optional(v.union([v.literal(0), v.literal(1)])),
  last_login_at: v.optional(v.string()), // ISO timestamp
  password: v.optional(v.pipe(v.string(), v.minLength(8))),
  role: v.optional(v.picklist(userRoleValues)),
})
export type UserUpdateInput = v.InferInput<typeof UserUpdateSchema>
export type UserUpdateOutput = v.InferOutput<typeof UserUpdateSchema>

export const UserAdminActionSchema = v.object({
  is_approved: v.optional(v.union([v.literal(0), v.literal(1)])),
  is_banned: v.optional(v.union([v.literal(0), v.literal(1)])),
})
export type UserAdminActionInput = v.InferInput<typeof UserAdminActionSchema>
export type UserAdminActionOutput = v.InferOutput<typeof UserAdminActionSchema>
