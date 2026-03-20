import { MatchCreateSchema, MatchIdSchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'

import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'

const matchesRoutes = new Elysia({ prefix: getApiRoutePrefixUrl(ApiRoutePrefix.matches) })
  // Get all matches for the authenticated user
  .get('/', async () => {
    // Dummy response: array of matches
    return {
      data: [
        {
          user1_id: 1,
          user2_id: 2,
        },
      ],
    }
  })
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
    { params: v.object({ id: v.string() }) },
  )

export default matchesRoutes
