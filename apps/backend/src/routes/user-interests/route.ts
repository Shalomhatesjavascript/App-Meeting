import { Elysia } from 'elysia'
import * as v from 'valibot'

import { getDrizzleDb } from '../../db/utils'
import { requireUser } from '../../lib/request-auth'
import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'
import { addUserInterest, getUserInterestsWithNames, removeUserInterest } from './model'

const UserInterestBodySchema = v.object({
  interest_id: v.number(),
  user_id: v.number(),
})

const userInterestsRoutes = new Elysia({
  prefix: getApiRoutePrefixUrl(ApiRoutePrefix['user-interests']),
})
  // Get all interests for a user
  .get(
    '/:userId',
    async ({ params, status }) => {
      const userId = Number(params.userId)
      if (!Number.isFinite(userId)) {
        return status(400, { error: 'Invalid user id' })
      }
      const db = getDrizzleDb()
      const interests = await getUserInterestsWithNames(db, userId)
      return {
        data: interests,
      }
    },
    { params: v.object({ userId: v.string() }) },
  )
  // Add an interest to a user
  .post(
    '/',
    async ({ body, headers, status }) => {
      try {
        const requester = await requireUser(headers)
        if (requester.role !== 'admin' && requester.id !== body.user_id) {
          return status(403, { error: 'Access denied' })
        }
        const db = getDrizzleDb()
        await addUserInterest(db, body.user_id, body.interest_id)
        return {
          data: body,
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to add interest'
        return status(400, { error: message })
      }
    },
    { body: UserInterestBodySchema },
  )
  // Remove an interest from a user
  .delete(
    '/',
    async ({ body, headers, status }) => {
      try {
        const requester = await requireUser(headers)
        if (requester.role !== 'admin' && requester.id !== body.user_id) {
          return status(403, { error: 'Access denied' })
        }
        const db = getDrizzleDb()
        await removeUserInterest(db, body.user_id, body.interest_id)
        return { success: true }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to remove interest'
        return status(400, { error: message })
      }
    },
    { body: UserInterestBodySchema },
  )

export default userInterestsRoutes
