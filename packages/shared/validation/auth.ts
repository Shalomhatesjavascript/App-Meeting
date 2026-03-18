import * as v from 'valibot'

// Email must end with @student.babcock.edu.ng or @babcock.edu.ng
const babcockEmailRegex = /^[\w.-]+@(student\.)?babcock\.edu\.ng$/i

export const RegisterSchema = v.object({
  email: v.pipe(
    v.string(),
    v.email(),
    v.regex(babcockEmailRegex, 'Email must be a Babcock student or staff email'),
  ),
  password: v.pipe(v.string(), v.minLength(8, 'Password must be at least 8 characters')),
  confirmPassword: v.pipe(v.string(), v.minLength(8)),
})
export type RegisterInput = v.InferInput<typeof RegisterSchema>
export type RegisterOutput = v.InferOutput<typeof RegisterSchema>

export const LoginSchema = v.object({
  email: v.pipe(
    v.string(),
    v.email(),
    v.regex(babcockEmailRegex, 'Email must be a Babcock student or staff email'),
  ),
  password: v.pipe(v.string(), v.minLength(8)),
})
export type LoginInput = v.InferInput<typeof LoginSchema>
export type LoginOutput = v.InferOutput<typeof LoginSchema>

export const VerifySchema = v.object({
  email: v.pipe(
    v.string(),
    v.email(),
    v.regex(babcockEmailRegex, 'Email must be a Babcock student or staff email'),
  ),
  code: v.pipe(v.string(), v.minLength(4), v.maxLength(12)), // e.g., OTP or verification code
})
export type VerifyInput = v.InferInput<typeof VerifySchema>
export type VerifyOutput = v.InferOutput<typeof VerifySchema>

export const ForgotPasswordSchema = v.object({
  email: v.pipe(
    v.string(),
    v.email(),
    v.regex(babcockEmailRegex, 'Email must be a Babcock student or staff email'),
  ),
})
export type ForgotPasswordInput = v.InferInput<typeof ForgotPasswordSchema>
export type ForgotPasswordOutput = v.InferOutput<typeof ForgotPasswordSchema>

export const ResetPasswordSchema = v.object({
  email: v.pipe(
    v.string(),
    v.email(),
    v.regex(babcockEmailRegex, 'Email must be a Babcock student or staff email'),
  ),
  code: v.pipe(v.string(), v.minLength(4), v.maxLength(12)),
  newPassword: v.pipe(v.string(), v.minLength(8)),
  confirmPassword: v.pipe(v.string(), v.minLength(8)),
})
export type ResetPasswordInput = v.InferInput<typeof ResetPasswordSchema>
export type ResetPasswordOutput = v.InferOutput<typeof ResetPasswordSchema>
