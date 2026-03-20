import { UserAdminActionSchema, UserCreateSchema, UserUpdateSchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'

import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'

const usersRoutes = new Elysia({ prefix: getApiRoutePrefixUrl(ApiRoutePrefix.users) })
  // Get all users (admin only)
  .get('/', async () => {
    // Dummy response: array of users
    return {
      data: [
        {
          email: 'admin@babcock.edu.ng',
          password: 'password123',
          role: 'admin',
        },
      ],
    }
  })
  // Get a single user by ID (admin or self)
  .get(
    '/:id',
    async ({ params }) => {
      // Dummy response: user object
      return {
        data: {
          email: 'user@babcock.edu.ng',
          password: 'password123',
          role: 'free',
        },
      }
    },
    { params: v.object({ id: v.string() }) },
  )
  // Update a user (admin or self)
  .patch(
    '/:id',
    async ({ params, body }) => {
      // Dummy response: updated user object
      return {
        data: {
          ...body,
        },
      }
    },
    { body: UserUpdateSchema, params: v.object({ id: v.string() }) },
  )
  // Delete a user (admin only)
  .delete(
    '/:id',
    async ({ params }) => {
      // Dummy response for deletion
      return { success: true }
    },
    { params: v.object({ id: v.string() }) },
  )
  // Ban a user (admin only)
  .post(
    '/:id/ban',
    async ({ params, body }) => {
      // Dummy response for ban action
      return {
        data: {
          ...body,
        },
      }
    },
    { body: UserAdminActionSchema, params: v.object({ id: v.string() }) },
  )
  // Approve a user (admin only)
  .post(
    '/:id/approve',
    async ({ params, body }) => {
      // Dummy response for approve action
      return {
        data: {
          ...body,
        },
      }
    },
    { body: UserAdminActionSchema, params: v.object({ id: v.string() }) },
  )
  // Get user statistics (admin only)
  .get(
    '/:id/stats',
    async ({ params }) => {
      // Dummy response for user stats
      return {
        data: {
          id: Number(params.id) || 1,
          stats: {
            likes: 0,
            matches: 0,
            posts: 0,
          },
        },
      }
    },
    { params: v.object({ id: v.string() }) },
  )

export default usersRoutes
