import { Elysia } from 'elysia'
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
      if (!(await isUserAdmin(db, user.id))) {
        return status(403, { error: 'Admin access required' })
      }

      const created = await createMatch(body)
      return created
    },
    { auth: true, body: MatchInsertSchema },
  )
  // Get all matches for the authenticated user
  .get(
    '/',
    async ({ user }) => {
      const matches = await listMatchesForUser(user.id)

      return {
        data: matches,
      }
    },
    { auth: true },
  )
  // Get details for a specific match
  .get(
    '/:id',
    async ({ params: { id }, user, status }) => {
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
    },
    { auth: true, params: NumberIdParamsSchema },
  )

export default matchesRoutes
