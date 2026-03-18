import { Elysia } from 'elysia'
import * as v from 'valibot'
import { ProfileCreateSchema, ProfileUpdateSchema } from '@repo/shared'

const profilesRoutes = new Elysia({ prefix: '/profiles' })
  // Get current user's profile
  .get(
    '/me',
    async () => {
      // Dummy response matching ProfileCreateSchema output
      return {
        data: {
          full_name: 'John Doe',
          alias: 'johnd',
          gender: 'male',
          department: 'Computer Science',
          level: 400,
          bio: 'Sample bio',
          intent: 'dating',
          is_id_verified: 1,
        },
      }
    }
  )
  // Get profile by user_id
  .get(
    '/:user_id',
    async ({ params }) => {
      // Dummy response matching ProfileCreateSchema output
      return {
        data: {
          full_name: 'Jane Doe',
          alias: 'janed',
          gender: 'female',
          department: 'Accounting',
          level: 300,
          bio: 'Another sample bio',
          intent: 'friendship',
          is_id_verified: 0,
        },
      }
    },
    { params: v.object({ user_id: v.string() }) }
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
    { body: ProfileCreateSchema }
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
    { params: v.object({ user_id: v.string() }), body: ProfileUpdateSchema }
  )
  // Delete profile by user_id
  .delete(
    '/:user_id',
    async ({ params }) => {
      // Dummy response for deletion
      return { success: true }
    },
    { params: v.object({ user_id: v.string() }) }
  )

export default profilesRoutes
