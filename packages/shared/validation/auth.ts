import * as v from 'valibot'
import { BabcockEmailSchema, StrongPasswordSchema } from './common'

export const RegisterSchema = v.object({
  confirmPassword: StrongPasswordSchema,
  email: BabcockEmailSchema,
  name: v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(100)),
  password: StrongPasswordSchema,
})
export type RegisterInput = v.InferInput<typeof RegisterSchema>
export type RegisterOutput = v.InferOutput<typeof RegisterSchema>

export const LoginSchema = v.object({
  email: BabcockEmailSchema,
  password: v.pipe(v.string(), v.trim(), v.minLength(8)),
})
export type LoginInput = v.InferInput<typeof LoginSchema>
export type LoginOutput = v.InferOutput<typeof LoginSchema>

export const VerifySchema = v.object({
  code: v.pipe(v.string(), v.trim(), v.minLength(4), v.maxLength(12)),
  email: BabcockEmailSchema,
})
export type VerifyInput = v.InferInput<typeof VerifySchema>
export type VerifyOutput = v.InferOutput<typeof VerifySchema>

export const ForgotPasswordSchema = v.object({
  email: BabcockEmailSchema,
})
export type ForgotPasswordInput = v.InferInput<typeof ForgotPasswordSchema>
export type ForgotPasswordOutput = v.InferOutput<typeof ForgotPasswordSchema>

export const ResetPasswordSchema = v.object({
  code: v.pipe(v.string(), v.trim(), v.minLength(4), v.maxLength(12)),
  confirmPassword: StrongPasswordSchema,
  email: BabcockEmailSchema,
  newPassword: StrongPasswordSchema,
})
export type ResetPasswordInput = v.InferInput<typeof ResetPasswordSchema>
export type ResetPasswordOutput = v.InferOutput<typeof ResetPasswordSchema>
