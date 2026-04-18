import { Elysia } from 'elysia'
import { toRouteError } from '../shared/route-error'
import { ApiRoutePrefixEnum } from '../shared/route-prefixes'
import { StringIdParamsSchema } from '../shared/schema'
import { isUserAdmin, isUserAdminOrSelf } from '../user/model'
import { betterAuthRoute } from '../utils/auth'
import { db } from '../utils/db'
import { createProfile, deleteProfile, getProfileByUserId, updateProfile } from './model'
import { ProfileInsertSchema, ProfileUpdateSchema } from './validation'

const profilesRoutes = new Elysia({ prefix: ApiRoutePrefixEnum.Profiles })
  .use(betterAuthRoute)
  // Get current user's profile
  .get(
    '/me',
    async ({ user, status }) => {
      try {
        const profile = await getProfileByUserId(db, user.id)

        if (!profile) {
          return status(404, { error: 'Profile not found' })
        }

        return profile
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to get profile')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true },
  )
  // Get profile by user_id. TODO: ensure that this is equivalent to /me for non-admins
  .get(
    '/:id',
    async ({ params: { id }, status, user }) => {
      try {
        const profile = await getProfileByUserId(db, id)

        if (!profile) {
          return status(404, { error: 'Profile not found' })
        }

        const canSeeFullName = Boolean(user) && ((await isUserAdmin(db, user.id)) || user.id === id)

        if (canSeeFullName) {
          return profile
        }

        const { fullName, ...publicProfile } = profile
        return publicProfile
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to fetch profile')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true, params: StringIdParamsSchema },
  )
  // Create profile
  .post(
    '/',
    async ({ body, user, status }) => {
      try {
        const created = await createProfile(db, user.id, { ...body, userId: user.id })
        return created
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to create profile')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true, body: ProfileInsertSchema },
  )
  // Update profile by user_id
  .put(
    '/:id',
    async ({ params, body, user, status }) => {
      try {
        if (!(await isUserAdminOrSelf(db, params.id, user.id))) {
          return status(403, { error: 'Access denied' })
        }

        const updated = await updateProfile(db, params.id, body)

        if (!updated) {
          return status(404, { error: 'Profile not found' })
        }

        return updated
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to update profile')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true, body: ProfileUpdateSchema, params: StringIdParamsSchema },
  )
  // Delete profile by user_id
  .delete(
    '/:id',
    async ({ params, user, status }) => {
      try {
        if (!(await isUserAdminOrSelf(db, params.id, user.id))) {
          return status(403, { error: 'Access denied' })
        }

        await deleteProfile(db, params.id)

        return { success: true }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to delete profile')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true, params: StringIdParamsSchema },
  )

export default profilesRoutes
