import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  VerifySchema,
} from '@repo/shared'
import { Elysia } from 'elysia'
import { getRouteErrorStatus } from '../../lib/route-error'
import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'
import { AuthModel } from './model'

const authRoutes = new Elysia({ prefix: getApiRoutePrefixUrl(ApiRoutePrefix.auth) })
  // User registration
  .post(
    '/register',
    async ({ body, status }) => {
      const result = await AuthModel.register(body)
      if (result.isErr()) {
        return status(getRouteErrorStatus(result.error.code), {
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
        return status(getRouteErrorStatus(result.error.code), {
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
        return status(getRouteErrorStatus(result.error.code), {
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
        return status(getRouteErrorStatus(result.error.code), {
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
        return status(getRouteErrorStatus(result.error.code), {
          code: result.error.code,
          error: result.error.message,
        })
      }
      return { data: result.value }
    },
    { body: ResetPasswordSchema },
  )

export default authRoutes
