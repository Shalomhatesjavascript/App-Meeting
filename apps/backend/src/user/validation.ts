import {
  BabcockEmailSchema,
  NonNegativeIntSchema,
  PositiveIntSchema,
  StrongPasswordSchema,
} from '@repo/shared'
import { createUpdateSchema } from 'drizzle-valibot'
import * as v from 'valibot'
import { UserMetaTable, type UserWithMetaUpdateDB } from './schema'

export type UserEmailSignUpOutput = {
  name: string
  email: string
  password: string
  image?: string | undefined
  callbackURL?: string | undefined
  rememberMe?: boolean | undefined
}

export const UserEmailSignUpSchema: v.GenericSchema<UserEmailSignUpOutput> = v.object({
  callbackURL: v.optional(v.string()),
  email: BabcockEmailSchema,
  image: v.optional(v.pipe(v.string(), v.url())),
  name: v.string(),
  password: StrongPasswordSchema,
  rememberMe: v.optional(v.boolean()),
})

export const UserWithMetaUpdateSchema: v.GenericSchema<UserWithMetaUpdateDB> = v.partial(
  v.object({
    meta: createUpdateSchema(UserMetaTable),
    user: v.partial(v.object({ email: BabcockEmailSchema, name: v.string() })),
  }),
)

export const UserSearchQuerySchema = v.object({
  limit: v.optional(PositiveIntSchema, 20),
  offset: v.optional(NonNegativeIntSchema, 20),
  query: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(100)),
})
export type UserSearchQueryInput = v.InferInput<typeof UserSearchQuerySchema>
export type UserSearchQueryOutput = v.InferOutput<typeof UserSearchQuerySchema>

export const UserListQuerySchema = v.object({
  limit: v.optional(PositiveIntSchema, 50),
  offset: v.optional(NonNegativeIntSchema, 0),
})
export type UserListQueryInput = v.InferInput<typeof UserListQuerySchema>
export type UserListQueryOutput = v.InferOutput<typeof UserListQuerySchema>
