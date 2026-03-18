import { ProfileCreateSchema, ProfileUpdateSchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'
import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'

const profilesRoutes = new Elysia({ prefix: getApiRoutePrefixUrl(ApiRoutePrefix.profiles) })
  // Get current user's profile
  .get('/me', async () => {
    // Dummy response matching ProfileCreateSchema output
    return {
      data: {
        alias: 'johnd',
        bio: 'Sample bio',
        department: 'Computer Science',
        full_name: 'John Doe',
        gender: 'male',
        intent: 'dating',
        is_id_verified: 1,
        level: 400,
      },
    }
  })
  // Get profile by user_id
  .get(
    '/:user_id',
    async ({ params }) => {
      // Dummy response matching ProfileCreateSchema output
      return {
        data: {
          alias: 'janed',
          bio: 'Another sample bio',
          department: 'Accounting',
          full_name: 'Jane Doe',
          gender: 'female',
          intent: 'friendship',
          is_id_verified: 0,
          level: 300,
        },
      }
    },
    { params: v.object({ user_id: v.string() }) },
  )
  // Create profile
  .post(
    '/',
    async ({ body }) => {
      // Dummy response matching ProfileCreateSchema output
      return {
        data: {
          ...body,
        },
      }
    },
    { body: ProfileCreateSchema },
  )
  // Update profile by user_id
  .put(
    '/:user_id',
    async ({ params, body }) => {
      // Dummy response matching ProfileUpdateSchema output
      return {
        data: {
          ...body,
        },
      }
    },
    { body: ProfileUpdateSchema, params: v.object({ user_id: v.string() }) },
  )
  // Delete profile by user_id
  .delete(
    '/:user_id',
    async ({ params }) => {
      // Dummy response for deletion
      return { success: true }
    },
    { params: v.object({ user_id: v.string() }) },
  )

export default profilesRoutes
