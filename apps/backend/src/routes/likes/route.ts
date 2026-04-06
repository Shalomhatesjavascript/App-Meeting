import { LikeCreateSchema, LikeIdSchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'
import { getDrizzleDb } from '../../db/utils'
import { requireUser } from '../../lib/request-auth'
import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'
import { createLike, getLikeById, getLikesForUser, getMutualLikes } from './model'

const likesRoutes = new Elysia({ prefix: getApiRoutePrefixUrl(ApiRoutePrefix.likes) })
  // Like or pass a user
  .post(
    '/',
    async ({ body, headers, status }) => {
      try {
        const requester = await requireUser(headers)
        if (requester.role !== 'admin' && requester.id !== body.from_user_id) {
          return status(403, { error: 'Access denied' })
        }

        const db = getDrizzleDb()
        const result = await createLike(db, body)
        return {
          data: result,
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create like'
        return status(400, { error: message })
      }
    },
    { body: LikeCreateSchema },
  )
  // Get mutual likes (matches) for the current user
  .get('/mutual', async ({ query, headers, status }) => {
    try {
      const requester = await requireUser(headers)
      const requestedUser = query.user_id ? Number(query.user_id) : requester.id
      if (!Number.isFinite(requestedUser)) {
        return status(400, { error: 'Invalid user id' })
      }
      if (requester.role !== 'admin' && requester.id !== requestedUser) {
        return status(403, { error: 'Access denied' })
      }
      const db = getDrizzleDb()
      const likes = await getMutualLikes(db, requestedUser)
      return {
        data: likes,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get mutual likes'
      return status(400, { error: message })
    }
  })
  // Get a like by ID
  .get(
    '/:id',
    async ({ params, headers, status }) => {
      try {
        await requireUser(headers)
        const parsed = v.safeParse(LikeIdSchema, { id: Number(params.id) })
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
        const message = error instanceof Error ? error.message : 'Failed to fetch like'
        return status(400, { error: message })
      }
    },
    { params: v.object({ id: v.string() }) },
  )
  // Get all likes for the current user (optionally filter by sent/received)
  .get('/', async ({ query, headers, status }) => {
    try {
      const requester = await requireUser(headers)
      const requestedUser = query.user_id ? Number(query.user_id) : requester.id
      const type = query.type === 'received' ? 'received' : 'sent'

      if (!Number.isFinite(requestedUser)) {
        return status(400, { error: 'Invalid user id' })
      }
      if (requester.role !== 'admin' && requester.id !== requestedUser) {
        return status(403, { error: 'Access denied' })
      }

      const db = getDrizzleDb()
      const likes = await getLikesForUser(db, requestedUser, type)
      return {
        data: likes,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list likes'
      return status(400, { error: message })
    }
  })

export default likesRoutes
