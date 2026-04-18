import { Elysia } from 'elysia'
import { toRouteError } from '../shared/route-error'
import { ApiRoutePrefixEnum } from '../shared/route-prefixes'
import { NumberIdParamsSchema } from '../shared/schema'
import { isUserAdmin } from '../user/model'
import { betterAuthRoute } from '../utils/auth'
import { db } from '../utils/db'
import { createMatch, getMatchById, listMatchesForUser } from './model'
import { MatchInsertSchema } from './validation'

const matchesRoutes = new Elysia({ prefix: ApiRoutePrefixEnum.Matches })
  .use(betterAuthRoute)
  // Create match (admin/system)
  .post(
    '/',
    async ({ body, user, status }) => {
      try {
        if (!(await isUserAdmin(db, user.id))) {
          return status(403, { error: 'Admin access required' })
        }

        const created = await createMatch(body)
        return created
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to create match')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true, body: MatchInsertSchema },
  )
  // Get all matches for the authenticated user
  .get(
    '/',
    async ({ user, status }) => {
      try {
        const matches = await listMatchesForUser(user.id)

        return {
          data: matches,
        }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to list matches')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true },
  )
  // Get details for a specific match
  .get(
    '/:id',
    async ({ params: { id }, user, status }) => {
      try {
        const match = await getMatchById(id)

        if (!match) {
          return status(404, { error: 'Match not found' })
        }

        if (
          !(await isUserAdmin(db, user.id)) &&
          user.id !== match.user1Id &&
          user.id !== match.user2Id
        ) {
          return status(403, { error: 'Access denied' })
        }

        return match
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to fetch match')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true, params: NumberIdParamsSchema },
  )

export default matchesRoutes
