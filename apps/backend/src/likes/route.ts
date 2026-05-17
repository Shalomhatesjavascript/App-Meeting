import { Elysia } from 'elysia'
import * as v from 'valibot'
import { ApiRoutePrefixEnum } from '../shared/route-prefixes'
import { NumberIdParamsSchema, StringIdParamsSchema } from '../shared/schema'
import { isUserAdminOrSelf } from '../user/model'
import { betterAuthRoute } from '../utils/auth'
import { db } from '../utils/db'
import { createOrUpdateLike, getLikeById, getLikesForUser, getMutualLikes } from './model'
import { LikeInsertSchema } from './validation'

const likesRoutes = new Elysia({ prefix: ApiRoutePrefixEnum.Likes })
  .use(betterAuthRoute)
  // Like or pass a user
  .post(
    '/',
    async ({ body, user, status }) => {
      const currentUserId = String(user.id)
      if (!(await isUserAdminOrSelf(db, body.fromUserId, currentUserId))) {
        return status(403, { error: 'Access denied' })
      }

      const result = await createOrUpdateLike(db, body)
      return result
    },
    { auth: true, body: LikeInsertSchema },
  )
  // Get mutual likes (matches) for the current user
  .get(
    '/mutual',
    async ({ query, user, status }) => {
      const currentUserId = String(user.id)
      const requestedUser = query.id != null ? String(query.id) : currentUserId

      if (!(await isUserAdminOrSelf(db, requestedUser, currentUserId))) {
        return status(403, { error: 'Access denied' })
      }
      const likes = await getMutualLikes(db, requestedUser)
      return likes
    },
    {
      auth: true,
      query: v.partial(
        v.object({
          ...StringIdParamsSchema.entries,
          type: v.optional(v.union([v.literal('received'), v.literal('sent')])),
        }),
      ),
    },
  )
  // Get a like by ID
  .get(
    '/:id',
    async ({ params: { id }, status }) => {
      const like = await getLikeById(db, id)
      if (!like) {
        return status(404, { error: 'Like not found' })
      }
      return like
    },
    { auth: true, params: NumberIdParamsSchema },
  )
  // Get all likes for the current user (optionally filter by sent/received)
  .get(
    '/',
    async ({ query, user, status }) => {
      const requestedUser = query.id ?? user.id

      if (!(await isUserAdminOrSelf(db, requestedUser, user.id))) {
        return status(403, { error: 'Access denied' })
      }

      const likes = await getLikesForUser(db, requestedUser, query.type)
      return likes
    },
    {
      auth: true,
      query: v.partial(
        v.object({
          ...StringIdParamsSchema.entries,
          type: v.picklist(['received', 'sent']),
        }),
      ),
    },
  )

export default likesRoutes
