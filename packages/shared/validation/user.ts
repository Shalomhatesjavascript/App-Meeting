// import * as v from 'valibot'
// import { BabcockEmailSchema, IsoTimestampSchema, StrongPasswordSchema } from './common'

// const userRoleValues = ['free', 'premium', 'admin'] as const

// export const UserCreateSchema = v.object({
//   email: BabcockEmailSchema,
//   password: StrongPasswordSchema,
//   role: v.picklist(userRoleValues),
// })
// export type UserCreateInput = v.InferInput<typeof UserCreateSchema>
// export type UserCreateOutput = v.InferOutput<typeof UserCreateSchema>

// export const UserUpdateSchema = v.object({
//   email: v.optional(BabcockEmailSchema),
//   is_approved: v.optional(v.union([v.literal(0), v.literal(1)])),
//   is_banned: v.optional(v.union([v.literal(0), v.literal(1)])),
//   is_verified: v.optional(v.union([v.literal(0), v.literal(1)])),
//   last_login_at: v.optional(IsoTimestampSchema),
//   password: v.optional(StrongPasswordSchema),
//   role: v.optional(v.picklist(userRoleValues)),
// })
// export type UserUpdateInput = v.InferInput<typeof UserUpdateSchema>
// export type UserUpdateOutput = v.InferOutput<typeof UserUpdateSchema>

// export const UserAdminActionSchema = v.object({
//   is_approved: v.optional(v.union([v.literal(0), v.literal(1)])),
//   is_banned: v.optional(v.union([v.literal(0), v.literal(1)])),
// })
// export type UserAdminActionInput = v.InferInput<typeof UserAdminActionSchema>
// export type UserAdminActionOutput = v.InferOutput<typeof UserAdminActionSchema>
