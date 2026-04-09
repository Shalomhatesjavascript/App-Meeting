import { MatchCreateSchema, MatchIdSchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'

import { parsePositiveInt } from '../../lib/input-parsers'
import { requireUser } from '../../lib/request-auth'
import { toRouteError } from '../../lib/route-error'
import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'
import { createMatch, getMatchById, listMatchesForUser } from './model'

const matchesRoutes = new Elysia({ prefix: getApiRoutePrefixUrl(ApiRoutePrefix.matches) })
  // Create match (admin/system)
  .post(
    '/',
    async ({ body, headers, status }) => {
      try {
        const requester = await requireUser(headers)
        if (requester.role !== 'admin') {
          return status(403, { error: 'Admin access required' })
        }
        const created = await createMatch(body)
        return { data: created }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to create match')
        return status(routeError.status, routeError.body)
      }
    },
    { body: MatchCreateSchema },
  )
  // Get all matches for the authenticated user
  .get('/', async ({ headers, status }) => {
    try {
      const requester = await requireUser(headers)
      const matches = await listMatchesForUser(requester.id)
      return {
        data: matches,
      }
    } catch (error) {
      const routeError = toRouteError(error, 'Failed to list matches')
      return status(routeError.status, routeError.body)
    }
  })
  // Get details for a specific match
  .get(
    '/:id',
    async ({ params, headers, status }) => {
      try {
        const requester = await requireUser(headers)
        const parsedId = parsePositiveInt(params.id)
        if (!parsedId.success) {
          return status(400, { error: 'Invalid match id' })
        }

        const parsed = v.safeParse(MatchIdSchema, { id: parsedId.value })
        if (!parsed.success) {
          return status(400, { error: 'Invalid match id' })
        }

        const match = await getMatchById(parsed.output.id)
        if (!match) {
          return status(404, { error: 'Match not found' })
        }

        if (
          requester.role !== 'admin' &&
          requester.id !== match.user1_id &&
          requester.id !== match.user2_id
        ) {
          return status(403, { error: 'Access denied' })
        }

        return {
          data: match,
        }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to fetch match')
        return status(routeError.status, routeError.body)
      }
    },
    { params: v.object({ id: v.string() }) },
  )

export default matchesRoutes
