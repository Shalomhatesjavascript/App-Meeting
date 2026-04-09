import { UserCreateSchema, UserSearchQuerySchema, UserUpdateSchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'
import { getDrizzleDb } from '../../db/utils'
import { isSelfOrAdmin } from '../../lib/access-control'
import { parseNonNegativeInt, parsePositiveInt } from '../../lib/input-parsers'
import { requireAdmin, requireUser } from '../../lib/request-auth'
import { toRouteError } from '../../lib/route-error'
import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'
import {
  adminActionUser,
  createUser,
  deleteUser,
  getUserById,
  getUserStats,
  listUsers,
  searchUsers,
  updateUser,
} from './model'

const usersRoutes = new Elysia({ prefix: getApiRoutePrefixUrl(ApiRoutePrefix.users) })
  // Create user (admin only)
  .post(
    '/',
    async ({ body, headers, status }) => {
      try {
        await requireAdmin(headers)
        const db = getDrizzleDb()
        const user = await createUser(db, body)
        return { data: user }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to create user')
        return status(routeError.status, routeError.body)
      }
    },
    { body: UserCreateSchema },
  )
  // Get users list (admin gets all fields; regular users get discoverable subset)
  .get('/', async ({ headers, status }) => {
    try {
      const requester = await requireUser(headers)
      const db = getDrizzleDb()
      const users = await listUsers(db)

      if (requester.role === 'admin') {
        return {
          data: users.map((user) => ({
            ...user,
            password_hash: undefined,
          })),
        }
      }

      const discoverable = users.filter(
        (user) =>
          user.id !== requester.id &&
          user.is_banned === 0 &&
          user.is_verified === 1 &&
          user.is_approved === 1,
      )

      return {
        data: discoverable.map((user) => ({
          ...user,
          password_hash: undefined,
        })),
      }
    } catch (error) {
      const routeError = toRouteError(error, 'Failed to list users')
      return status(routeError.status, routeError.body)
    }
  })
  // Search users by email, alias, full name, or department
  .get('/search', async ({ headers, query, status }) => {
    try {
      const requester = await requireUser(headers)
      const db = getDrizzleDb()

      const parsedLimit = query?.limit ? parsePositiveInt(query.limit) : null
      const parsedOffset = query?.offset ? parseNonNegativeInt(query.offset) : null
      if (parsedLimit && !parsedLimit.success) {
        return status(400, { error: 'Invalid query parameters' })
      }
      if (parsedOffset && !parsedOffset.success) {
        return status(400, { error: 'Invalid query parameters' })
      }

      const parsed = v.safeParse(UserSearchQuerySchema, {
        limit: parsedLimit?.success ? parsedLimit.value : undefined,
        offset: parsedOffset?.success ? parsedOffset.value : undefined,
        q: query?.q,
      })

      if (!parsed.success) {
        return status(400, { error: 'Invalid query parameters' })
      }

      // Require q to be provided and non-empty after trimming
      if (!parsed.output.q) {
        return status(400, { error: 'q is required' })
      }

      const limit = Math.min(parsed.output.limit ?? 20, 100)
      const offset = Math.max(parsed.output.offset ?? 0, 0)

      const users = await searchUsers(db, requester.id, parsed.output.q, limit, offset)
      return { data: users }
    } catch (error) {
      const routeError = toRouteError(error, 'Failed to search users')
      return status(routeError.status, routeError.body)
    }
  })
  // Get a single user by ID (admin or self)
  .get(
    '/:id',
    async ({ params, headers, status }) => {
      try {
        const requester = await requireUser(headers)
        const parsed = parsePositiveInt(params.id)
        if (!parsed.success) {
          return status(400, { error: 'Invalid user id' })
        }
        if (!isSelfOrAdmin(requester, parsed.value)) {
          return status(403, { error: 'Access denied' })
        }
        const db = getDrizzleDb()
        const user = await getUserById(db, parsed.value)
        if (!user) {
          return status(404, { error: 'User not found' })
        }
        return {
          data: {
            ...user,
            password_hash: undefined,
          },
        }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to fetch user')
        return status(routeError.status, routeError.body)
      }
    },
    { params: v.object({ id: v.string() }) },
  )
  // Update a user (admin or self)
  .patch(
    '/:id',
    async ({ params, body, headers, status }) => {
      try {
        const requester = await requireUser(headers)
        const parsed = parsePositiveInt(params.id)
        if (!parsed.success) {
          return status(400, { error: 'Invalid user id' })
        }
        if (!isSelfOrAdmin(requester, parsed.value)) {
          return status(403, { error: 'Access denied' })
        }
        const db = getDrizzleDb()
        const user = await updateUser(db, parsed.value, body)
        if (!user) {
          return status(404, { error: 'User not found' })
        }
        return {
          data: {
            ...user,
            password_hash: undefined,
          },
        }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to update user')
        return status(routeError.status, routeError.body)
      }
    },
    { body: UserUpdateSchema, params: v.object({ id: v.string() }) },
  )
  // Delete a user (admin only)
  .delete(
    '/:id',
    async ({ params, headers, status }) => {
      try {
        await requireAdmin(headers)
        const parsed = parsePositiveInt(params.id)
        if (!parsed.success) {
          return status(400, { error: 'Invalid user id' })
        }
        const db = getDrizzleDb()
        await deleteUser(db, parsed.value)
        return { success: true }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to delete user')
        return status(routeError.status, routeError.body)
      }
    },
    { params: v.object({ id: v.string() }) },
  )
  // Ban a user (admin only)
  .post(
    '/:id/ban',
    async ({ params, headers, status }) => {
      try {
        const admin = await requireAdmin(headers)
        const parsed = parsePositiveInt(params.id)
        if (!parsed.success) {
          return status(400, { error: 'Invalid user id' })
        }
        const db = getDrizzleDb()
        const updated = await adminActionUser(db, parsed.value, { is_banned: 1 })
        return {
          data: {
            ...updated,
            password_hash: undefined,
            updatedBy: admin.id,
          },
        }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to ban user')
        return status(routeError.status, routeError.body)
      }
    },
    { params: v.object({ id: v.string() }) },
  )
  // Approve a user (admin only)
  .post(
    '/:id/approve',
    async ({ params, headers, status }) => {
      try {
        const admin = await requireAdmin(headers)
        const parsed = parsePositiveInt(params.id)
        if (!parsed.success) {
          return status(400, { error: 'Invalid user id' })
        }
        const db = getDrizzleDb()
        const updated = await adminActionUser(db, parsed.value, { is_approved: 1 })
        return {
          data: {
            ...updated,
            password_hash: undefined,
            updatedBy: admin.id,
          },
        }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to approve user')
        return status(routeError.status, routeError.body)
      }
    },
    { params: v.object({ id: v.string() }) },
  )
  // Get user statistics (admin only)
  .get(
    '/:id/stats',
    async ({ params, headers, status }) => {
      try {
        await requireAdmin(headers)
        const parsed = parsePositiveInt(params.id)
        if (!parsed.success) {
          return status(400, { error: 'Invalid user id' })
        }
        const db = getDrizzleDb()
        const stats = await getUserStats(db, parsed.value)
        return {
          data: {
            id: parsed.value,
            stats,
          },
        }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to fetch stats')
        return status(routeError.status, routeError.body)
      }
    },
    { params: v.object({ id: v.string() }) },
  )

export default usersRoutes
