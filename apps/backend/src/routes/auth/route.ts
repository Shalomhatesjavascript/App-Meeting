import { LoginSchema, RegisterSchema } from '@repo/shared'
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

export default authRoutes
