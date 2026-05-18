import { Elysia } from 'elysia'
import * as v from 'valibot'
import { ApiRoutePrefixEnum } from '../shared/route-prefixes'
import { StringIdParamsSchema } from '../shared/schema'
import { betterAuthRoute } from '../utils/auth'
import { db } from '../utils/db'
import { UserMetaRoleEnum } from './enum'
import {
  adminActionUser,
  createUser,
  deleteUser,
  getUserById,
  getUserRole,
  getUserStats,
  isUserAdmin,
  isUserAdminOrSelf,
  listUsers,
  searchUsers,
  updateUser,
} from './model'
import {
  UserEmailSignUpSchema,
  UserListQuerySchema,
  UserSearchQuerySchema,
  UserWithMetaUpdateSchema,
} from './validation'

const usersRoutes = new Elysia({ prefix: ApiRoutePrefixEnum.Users })
  .use(betterAuthRoute)
  // Create user (admin only)
  .post(
    '/',
    async ({ body, status, user: { id: requesterId } }) => {
      if (!(await isUserAdmin(db, requesterId))) return status('Unauthorized')

      const user = await createUser(db, body)

      return user
    },
    { auth: true, body: UserEmailSignUpSchema },
  )
  // Get users list (admin gets all fields; regular users get discoverable subset)
  .get(
    '/',
    async ({ query, user: { id: requesterId } }) => {
      const { limit, offset } = query
      const requesterIsAdmin = (await getUserRole(db, requesterId)) === UserMetaRoleEnum.Admin

      if (requesterIsAdmin) {
        return await listUsers(db, { limit, offset })
      }

      return await listUsers(db, { limit, offset, requesterId })
    },
    { auth: true, query: UserListQuerySchema },
  )
  // Search users by email, alias, full name, or department
  .get(
    '/search',
    async ({ user, query }) => {
      return await searchUsers({ ...query, db, requesterId: user.id })
    },
    { auth: true, query: UserSearchQuerySchema },
  )
  // Get a single user by ID (admin or self)
  .get(
    '/:id',
    async ({ params, status, user: { id: requesterId } }) => {
      if (!(await isUserAdminOrSelf(db, params.id, requesterId))) {
        return status('Forbidden')
      }

      const userData = await getUserById(db, params.id)

      if (!userData) {
        return status('Not Found')
      }

      return userData
    },
    { auth: true, params: StringIdParamsSchema },
  )
  // Update a user (admin or self)
  .patch(
    '/:id',
    async ({ params, body, user: { id: requesterId }, status }) => {
      if (!(await isUserAdminOrSelf(db, params.id, requesterId))) {
        return status(403, { error: 'Access denied' })
      }

      const user = await updateUser(db, params.id, body)

      if (!user) {
        return status(404, { error: 'User not found' })
      }

      return user
    },
    { auth: true, body: UserWithMetaUpdateSchema, params: StringIdParamsSchema },
  )
  // Delete a user (admin only)
  .delete(
    '/:id',
    async ({ params, user, status }) => {
      if (!(await isUserAdmin(db, user.id))) return status('Unauthorized')

      return await deleteUser(db, params.id)
    },
    { auth: true, params: StringIdParamsSchema },
  )
  // Ban a user (admin only)
  .post(
    '/:id/ban',
    async ({ params, user, status, query }) => {
      if (!(await isUserAdmin(db, user.id))) return status('Unauthorized')

      const updated = await adminActionUser(db, params.id, { isBanned: query.shouldBan })

      return {
        ...updated,
        updatedBy: user.id,
      }
    },
    {
      auth: true,
      params: StringIdParamsSchema,
      query: v.object({ shouldBan: v.optional(v.pipe(v.unknown(), v.parseBoolean()), true) }),
    },
  )
  // Approve a user (admin only)
  .post(
    '/:id/approve',
    async ({ params, user, status }) => {
      if (!(await isUserAdmin(db, user.id))) return status('Unauthorized')

      const updated = await adminActionUser(db, params.id, { isApproved: true })

      return {
        ...updated,
        updatedBy: user.id,
      }
    },
    { auth: true, params: StringIdParamsSchema },
  )
  // Get user statistics (admin only)
  .get(
    '/:id/stats',
    async ({ params, user, status }) => {
      if (!(await isUserAdmin(db, user.id))) return status('Unauthorized')

      const stats = await getUserStats(db, params.id)

      return stats
    },
    { auth: true, params: StringIdParamsSchema },
  )

export default usersRoutes
