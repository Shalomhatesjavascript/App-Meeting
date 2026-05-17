import { Elysia } from 'elysia'
import { ApiRoutePrefixEnum } from '../shared/route-prefixes'
import { betterAuthRoute } from '../utils/auth'
import { db } from '../utils/db'
import { getDiscoveryFeed, getPossibleMatches, getRecommendations } from './model'
import {
  DiscoveryCandidatesQuerySchema,
  DiscoveryPossibleMatchesQuerySchema,
  DiscoveryRecommendationsQuerySchema,
} from './validation'

const discoveryRoutes = new Elysia({ prefix: ApiRoutePrefixEnum.Discovery })
  .use(betterAuthRoute)
  // Get recommendation feed of users
  .get(
    '/recommendations',
    async ({ user, query }) => {
      const limit = Math.min(query.limit ?? 50, 100)
      const offset = Math.max(query.offset ?? 0, 0)

      const recommendations = await getRecommendations(db, user.id, limit, offset)

      return recommendations
    },
    { auth: true, query: DiscoveryRecommendationsQuerySchema },
  )
  // Get stronger-ranked possible matches for current user
  .get(
    '/possible-matches',
    async ({ user, query }) => {
      const limit = Math.min(query.limit ?? 20, 100)
      const offset = Math.max(query.offset ?? 0, 0)
      const minScore = Math.max(query.minScore ?? 100, 0)

      const matches = await getPossibleMatches(db, user.id, limit, offset, minScore)

      return matches
    },
    { auth: true, query: DiscoveryPossibleMatchesQuerySchema },
  )
  // Get discovery feed of recommended users
  .get(
    '/candidates',
    async ({ user, query }) => {
      const limit = Math.min(query.limit ?? 50, 100)
      const offset = Math.max(query.offset ?? 0, 0)

      const candidates = await getDiscoveryFeed(db, user.id, limit, offset)

      return candidates
    },
    { auth: true, query: DiscoveryCandidatesQuerySchema },
  )

export default discoveryRoutes
