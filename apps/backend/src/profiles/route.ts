import { Elysia } from 'elysia'
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
      const profile = await getProfileByUserId(db, user.id)

      if (!profile) {
        return status(404, { error: 'Profile not found' })
      }

      return profile
    },
    { auth: true },
  )
  // Get profile by user_id. TODO: ensure that this is equivalent to /me for non-admins
  .get(
    '/:id',
    async ({ params: { id }, status, user }) => {
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
    },
    { auth: true, params: StringIdParamsSchema },
  )
  // Create profile
  .post(
    '/',
    async ({ body, user, status }) => {
      const targetUserId = body.userId ?? user.id

      if (!(await isUserAdminOrSelf(db, targetUserId, user.id))) {
        return status(403, { error: 'Access denied' })
      }

      const created = await createProfile(db, { ...body, userId: targetUserId })

      return created
    },
    { auth: true, body: ProfileInsertSchema },
  )
  // Update self
  .put(
    '/',
    async ({ body, user, status }) => {
      const updated = await updateProfile(db, user.id, body)

      if (!updated) {
        return status(404, { error: 'Profile not found' })
      }

      return updated
    },
    { auth: true, body: ProfileUpdateSchema },
  )
  // Update profile by user_id
  .put(
    '/:id',
    async ({ params, body, user, status }) => {
      if (!(await isUserAdminOrSelf(db, params.id, user.id))) {
        return status(403, { error: 'Access denied' })
      }

      const updated = await updateProfile(db, params.id, body)

      if (!updated) {
        return status(404, { error: 'Profile not found' })
      }

      return updated
    },
    { auth: true, body: ProfileUpdateSchema, params: StringIdParamsSchema },
  )
  // Delete profile by user_id
  .delete(
    '/:id',
    async ({ params, user, status }) => {
      if (!(await isUserAdminOrSelf(db, params.id, user.id))) {
        return status(403, { error: 'Access denied' })
      }

      await deleteProfile(db, params.id)

      return { success: true }
    },
    { auth: true, params: StringIdParamsSchema },
  )

export default profilesRoutes
