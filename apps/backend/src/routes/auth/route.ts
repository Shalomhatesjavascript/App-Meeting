import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  VerifySchema,
} from '@repo/shared'
import { Elysia } from 'elysia'
import { type AuthErrorCode, AuthErrorCodeEnum } from '../../lib/auth-enums'
import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'
import { AuthModel } from './model'

function statusFromCode(code: AuthErrorCode): number {
  switch (code) {
    case AuthErrorCodeEnum.AUTHENTICATION_REQUIRED:
      return 401
    case AuthErrorCodeEnum.FORBIDDEN:
      return 403
    case AuthErrorCodeEnum.NOT_FOUND:
      return 404
    case AuthErrorCodeEnum.CONFLICT:
      return 409
    case AuthErrorCodeEnum.VALIDATION_ERROR:
      return 400
    default:
      return 500
  }
}

const authRoutes = new Elysia({ prefix: getApiRoutePrefixUrl(ApiRoutePrefix.auth) })
  // User registration
  .post(
    '/register',
    async ({ body, status }) => {
      const result = await AuthModel.register(body)
      if (result.isErr()) {
        return status(statusFromCode(result.error.code), {
          code: result.error.code,
          error: result.error.message,
        })
      }
      return { data: result.value }
    },
    { body: RegisterSchema },
  )
  // User login
  .post(
    '/login',
    async ({ body, status }) => {
      const result = await AuthModel.login(body)
      if (result.isErr()) {
        return status(statusFromCode(result.error.code), {
          code: result.error.code,
          error: result.error.message,
        })
      }
      return { data: result.value }
    },
    { body: LoginSchema },
  )
  // User logout
  .post('/logout', async () => {
    return { success: true }
  })
  // Email verification
  .post(
    '/verify',
    async ({ body, status }) => {
      const result = await AuthModel.verify(body)
      if (result.isErr()) {
        return status(statusFromCode(result.error.code), {
          code: result.error.code,
          error: result.error.message,
        })
      }
      return { data: result.value }
    },
    { body: VerifySchema },
  )
  // Forgot password
  .post(
    '/forgot-password',
    async ({ body, status }) => {
      const result = await AuthModel.forgotPassword(body)
      if (result.isErr()) {
        return status(statusFromCode(result.error.code), {
          code: result.error.code,
          error: result.error.message,
        })
      }
      return { data: result.value }
    },
    { body: ForgotPasswordSchema },
  )
  // Reset password
  .post(
    '/reset-password',
    async ({ body, status }) => {
      const result = await AuthModel.resetPassword(body)
      if (result.isErr()) {
        return status(statusFromCode(result.error.code), {
          code: result.error.code,
          error: result.error.message,
        })
      }
      return { data: result.value }
    },
    { body: ResetPasswordSchema },
  )

export default authRoutes
