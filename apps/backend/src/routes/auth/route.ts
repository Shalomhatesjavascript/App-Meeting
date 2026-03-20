import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  VerifySchema,
} from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'
import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'

const authRoutes = new Elysia({ prefix: getApiRoutePrefixUrl(ApiRoutePrefix.auth) })
  // User registration
  .post(
    '/register',
    async ({ body }) => {
      // Dummy response matching RegisterSchema output
      return {
        data: {
          confirmPassword: body.confirmPassword ?? 'password123',
          email: body.email ?? 'dummy@student.babcock.edu.ng',
          password: body.password ?? 'password123',
        },
      }
    },
    { body: RegisterSchema },
  )
  // User login
  .post(
    '/login',
    async ({ body }) => {
      // Dummy response matching LoginSchema output
      return {
        data: {
          email: body.email ?? 'dummy@student.babcock.edu.ng',
          password: body.password ?? 'password123',
        },
      }
    },
    { body: LoginSchema },
  )
  // User logout
  .post('/logout', async ({ body }) => {
    // Dummy response for logout (no schema, just acknowledge)
    return { success: true }
  })
  // Email verification
  .post(
    '/verify',
    async ({ body }) => {
      // Dummy response matching VerifySchema output
      return {
        data: {
          code: body.code ?? '1234',
          email: body.email ?? 'dummy@student.babcock.edu.ng',
        },
      }
    },
    { body: VerifySchema },
  )
  // Forgot password
  .post(
    '/forgot-password',
    async ({ body }) => {
      // Dummy response matching ForgotPasswordSchema output
      return {
        data: {
          email: body.email ?? 'dummy@student.babcock.edu.ng',
        },
      }
    },
    { body: ForgotPasswordSchema },
  )
  // Reset password
  .post(
    '/reset-password',
    async ({ body }) => {
      // Dummy response matching ResetPasswordSchema output
      return {
        data: {
          code: body.code ?? '1234',
          confirmPassword: body.confirmPassword ?? 'password123',
          email: body.email ?? 'dummy@student.babcock.edu.ng',
          newPassword: body.newPassword ?? 'password123',
        },
      }
    },
    { body: ResetPasswordSchema },
  )

export default authRoutes
