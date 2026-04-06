import { ProfileCreateSchema, ProfileUpdateSchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'
import { getDrizzleDb } from '../../db/utils'
import { requireUser } from '../../lib/request-auth'
import { toRouteError } from '../../lib/route-error'
import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'
import { createProfile, deleteProfile, getProfileByUserId, updateProfile } from './model'

const profilesRoutes = new Elysia({ prefix: getApiRoutePrefixUrl(ApiRoutePrefix.profiles) })
  // Get current user's profile
  .get('/me', async ({ headers, status }) => {
    try {
      const requester = await requireUser(headers)
      const db = getDrizzleDb()
      const profile = await getProfileByUserId(db, requester.id)
      if (!profile) {
        return status(404, { error: 'Profile not found' })
      }
      return { data: profile }
    } catch (error) {
      const routeError = toRouteError(error, 'Failed to get profile')
      return status(routeError.status, routeError.body)
    }
  })
  // Get profile by user_id
  .get(
    '/:user_id',
    async ({ params, status }) => {
      try {
        const user_id = Number(params.user_id)
        if (!Number.isFinite(user_id)) {
          return status(400, { error: 'Invalid user id' })
        }

        const db = getDrizzleDb()
        const profile = await getProfileByUserId(db, user_id)
        if (!profile) {
          return status(404, { error: 'Profile not found' })
        }
        return { data: profile }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to fetch profile')
        return status(routeError.status, routeError.body)
      }
    },
    { params: v.object({ user_id: v.string() }) },
  )
  // Create profile
  .post(
    '/',
    async ({ body, headers, status }) => {
      try {
        const requester = await requireUser(headers)
        const db = getDrizzleDb()
        const created = await createProfile(db, requester.id, body)
        return { data: created }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to create profile')
        return status(routeError.status, routeError.body)
      }
    },
    { body: ProfileCreateSchema },
  )
  // Update profile by user_id
  .put(
    '/:user_id',
    async ({ params, body, headers, status }) => {
      try {
        const requester = await requireUser(headers)
        const user_id = Number(params.user_id)
        if (!Number.isFinite(user_id)) {
          return status(400, { error: 'Invalid user id' })
        }
        if (requester.role !== 'admin' && requester.id !== user_id) {
          return status(403, { error: 'Access denied' })
        }
        const db = getDrizzleDb()
        const updated = await updateProfile(db, user_id, body)
        if (!updated) {
          return status(404, { error: 'Profile not found' })
        }
        return { data: updated }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to update profile')
        return status(routeError.status, routeError.body)
      }
    },
    { body: ProfileUpdateSchema, params: v.object({ user_id: v.string() }) },
  )
  // Delete profile by user_id
  .delete(
    '/:user_id',
    async ({ params, headers, status }) => {
      try {
        const requester = await requireUser(headers)
        const user_id = Number(params.user_id)
        if (!Number.isFinite(user_id)) {
          return status(400, { error: 'Invalid user id' })
        }
        if (requester.role !== 'admin' && requester.id !== user_id) {
          return status(403, { error: 'Access denied' })
        }
        const db = getDrizzleDb()
        await deleteProfile(db, user_id)
        return { success: true }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to delete profile')
        return status(routeError.status, routeError.body)
      }
    },
    { params: v.object({ user_id: v.string() }) },
  )

export default profilesRoutes
