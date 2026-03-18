import { Elysia } from 'elysia'
import * as v from 'valibot'
import { MatchCreateSchema, MatchIdSchema } from '@repo/shared'

const matchesRoutes = new Elysia({ prefix: '/matches' })
  // Get all matches for the authenticated user
  .get(
    '/',
    async () => {
      // Dummy response: array of matches
      return {
        data: [
          {
            user1_id: 1,
            user2_id: 2,
          },
        ],
      }
    }
  )
  // Get details for a specific match
  .get(
    '/:id',
    async ({ params }) => {
      // Dummy response matching MatchIdSchema output
      return {
        data: {
          id: Number(params.id) || 1,
        },
      }
    },
    { params: v.object({ id: v.string() }) }
  )

export default matchesRoutes
