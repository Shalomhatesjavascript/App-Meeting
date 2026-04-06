import { UserAdminActionSchema, UserCreateSchema, UserUpdateSchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'
import { getDrizzleDb } from '../../db/utils'
import { requireAdmin, requireUser } from '../../lib/request-auth'
import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'
import {
  adminActionUser,
  createUser,
  deleteUser,
  getUserById,
  getUserStats,
  listUsers,
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
        const message = error instanceof Error ? error.message : 'Failed to create user'
        return status(message.includes('Admin') ? 403 : 400, { error: message })
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
      const message = error instanceof Error ? error.message : 'Failed to list users'
      return status(401, { error: message })
    }
  })
  // Get a single user by ID (admin or self)
  .get(
    '/:id',
    async ({ params, headers, status }) => {
      try {
        const requester = await requireUser(headers)
        const id = Number(params.id)
        if (!Number.isFinite(id)) {
          return status(400, { error: 'Invalid user id' })
        }
        if (requester.role !== 'admin' && requester.id !== id) {
          return status(403, { error: 'Access denied' })
        }
        const db = getDrizzleDb()
        const user = await getUserById(db, id)
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
        const message = error instanceof Error ? error.message : 'Failed to fetch user'
        return status(401, { error: message })
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
        const id = Number(params.id)
        if (!Number.isFinite(id)) {
          return status(400, { error: 'Invalid user id' })
        }
        if (requester.role !== 'admin' && requester.id !== id) {
          return status(403, { error: 'Access denied' })
        }
        const db = getDrizzleDb()
        const user = await updateUser(db, id, body)
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
        const message = error instanceof Error ? error.message : 'Failed to update user'
        return status(400, { error: message })
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
        const id = Number(params.id)
        if (!Number.isFinite(id)) {
          return status(400, { error: 'Invalid user id' })
        }
        const db = getDrizzleDb()
        await deleteUser(db, id)
        return { success: true }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete user'
        return status(message.includes('Admin') ? 403 : 400, { error: message })
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
        const id = Number(params.id)
        if (!Number.isFinite(id)) {
          return status(400, { error: 'Invalid user id' })
        }
        const db = getDrizzleDb()
        const updated = await adminActionUser(db, id, { is_banned: 1 })
        return {
          data: {
            ...updated,
            password_hash: undefined,
            updatedBy: admin.id,
          },
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to ban user'
        return status(message.includes('Admin') ? 403 : 400, { error: message })
      }
    },
    { body: UserAdminActionSchema, params: v.object({ id: v.string() }) },
  )
  // Approve a user (admin only)
  .post(
    '/:id/approve',
    async ({ params, headers, status }) => {
      try {
        const admin = await requireAdmin(headers)
        const id = Number(params.id)
        if (!Number.isFinite(id)) {
          return status(400, { error: 'Invalid user id' })
        }
        const db = getDrizzleDb()
        const updated = await adminActionUser(db, id, { is_approved: 1 })
        return {
          data: {
            ...updated,
            password_hash: undefined,
            updatedBy: admin.id,
          },
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to approve user'
        return status(message.includes('Admin') ? 403 : 400, { error: message })
      }
    },
    { body: UserAdminActionSchema, params: v.object({ id: v.string() }) },
  )
  // Get user statistics (admin only)
  .get(
    '/:id/stats',
    async ({ params, headers, status }) => {
      try {
        await requireAdmin(headers)
        const id = Number(params.id)
        if (!Number.isFinite(id)) {
          return status(400, { error: 'Invalid user id' })
        }
        const db = getDrizzleDb()
        const stats = await getUserStats(db, id)
        return {
          data: {
            id,
            stats,
          },
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch stats'
        return status(message.includes('Admin') ? 403 : 400, { error: message })
      }
    },
    { params: v.object({ id: v.string() }) },
  )

export default usersRoutes
