import { Elysia } from 'elysia'
import * as v from 'valibot'
import { LikeCreateSchema, LikeIdSchema } from '@repo/shared'

const likesRoutes = new Elysia({ prefix: '/likes' })
  // Like or pass a user
  .post(
    '/',
    async ({ body }) => {
      // Dummy response matching LikeCreateSchema output
      return {
        data: {
          from_user_id: body.from_user_id ?? 1,
          to_user_id: body.to_user_id ?? 2,
          is_like: body.is_like ?? true,
        },
      }
    },
    { body: LikeCreateSchema }
  )
  // Get a like by ID
  .get(
    '/:id',
    async ({ params }) => {
      // Dummy response matching LikeIdSchema output
      return {
        data: {
          id: Number(params.id) || 1,
        },
      }
    },
    { params: v.object({ id: v.string() }) }
  )
  // Get all likes for the current user (optionally filter by sent/received)
  .get(
    '/',
    async ({ query }) => {
      // Dummy response for likes list
      return {
        data: [
          {
            from_user_id: 1,
            to_user_id: 2,
            is_like: true,
          },
        ],
        query,
      }
    }
  )
  // Get mutual likes (matches) for the current user
  .get(
    '/mutual',
    async ({ query }) => {
      // Dummy response for mutual likes
      return {
        data: [
          {
            from_user_id: 1,
            to_user_id: 2,
            is_like: true,
          },
        ],
        query,
      }
    }
  )

export default likesRoutes
