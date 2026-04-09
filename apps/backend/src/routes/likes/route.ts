import { LikeCreateSchema, LikeIdSchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'
import { getDrizzleDb } from '../../db/utils'
import { isSelfOrAdmin } from '../../lib/access-control'
import { parsePositiveInt } from '../../lib/input-parsers'
import { requireUser } from '../../lib/request-auth'
import { toRouteError } from '../../lib/route-error'
import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'
import { createLike, getLikeById, getLikesForUser, getMutualLikes } from './model'

const likesRoutes = new Elysia({ prefix: getApiRoutePrefixUrl(ApiRoutePrefix.likes) })
  // Like or pass a user
  .post(
    '/',
    async ({ body, headers, status }) => {
      try {
        const requester = await requireUser(headers)
        if (!isSelfOrAdmin(requester, body.from_user_id)) {
          return status(403, { error: 'Access denied' })
        }

        const db = getDrizzleDb()
        const result = await createLike(db, body)
        return {
          data: result,
        }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to create like')
        return status(routeError.status, routeError.body)
      }
    },
    { body: LikeCreateSchema },
  )
  // Get mutual likes (matches) for the current user
  .get('/mutual', async ({ query, headers, status }) => {
    try {
      const requester = await requireUser(headers)
      const parsedRequestedUser = query.user_id ? parsePositiveInt(query.user_id) : null
      if (parsedRequestedUser && !parsedRequestedUser.success) {
        return status(400, { error: 'Invalid user id' })
      }
      const requestedUser = parsedRequestedUser?.success ? parsedRequestedUser.value : requester.id

      if (!isSelfOrAdmin(requester, requestedUser)) {
        return status(403, { error: 'Access denied' })
      }
      const db = getDrizzleDb()
      const likes = await getMutualLikes(db, requestedUser)
      return {
        data: likes,
      }
    } catch (error) {
      const routeError = toRouteError(error, 'Failed to get mutual likes')
      return status(routeError.status, routeError.body)
    }
  })
  // Get a like by ID
  .get(
    '/:id',
    async ({ params, headers, status }) => {
      try {
        await requireUser(headers)
        const parsedId = parsePositiveInt(params.id)
        if (!parsedId.success) {
          return status(400, { error: 'Invalid like id' })
        }

        const parsed = v.safeParse(LikeIdSchema, { id: parsedId.value })
        if (!parsed.success) {
          return status(400, { error: 'Invalid like id' })
        }
        const db = getDrizzleDb()
        const like = await getLikeById(db, parsed.output.id)
        if (!like) {
          return status(404, { error: 'Like not found' })
        }
        return {
          data: like,
        }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to fetch like')
        return status(routeError.status, routeError.body)
      }
    },
    { params: v.object({ id: v.string() }) },
  )
  // Get all likes for the current user (optionally filter by sent/received)
  .get('/', async ({ query, headers, status }) => {
    try {
      const requester = await requireUser(headers)
      const parsedRequestedUser = query.user_id ? parsePositiveInt(query.user_id) : null
      if (parsedRequestedUser && !parsedRequestedUser.success) {
        return status(400, { error: 'Invalid user id' })
      }

      const requestedUser = parsedRequestedUser?.success ? parsedRequestedUser.value : requester.id
      const type = query.type === 'received' ? 'received' : 'sent'

      if (!isSelfOrAdmin(requester, requestedUser)) {
        return status(403, { error: 'Access denied' })
      }

      const db = getDrizzleDb()
      const likes = await getLikesForUser(db, requestedUser, type)
      return {
        data: likes,
      }
    } catch (error) {
      const routeError = toRouteError(error, 'Failed to list likes')
      return status(routeError.status, routeError.body)
    }
  })

export default likesRoutes
