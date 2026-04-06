import {
  DiscoveryCandidatesQuerySchema,
  DiscoveryPossibleMatchesQuerySchema,
  DiscoveryRecommendationsQuerySchema,
} from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'
import { getDrizzleDb } from '../../db/utils'
import { requireUser } from '../../lib/request-auth'
import { toRouteError } from '../../lib/route-error'
import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'
import { getDiscoveryFeed, getPossibleMatches, getRecommendations } from './model'

const discoveryRoutes = new Elysia({ prefix: getApiRoutePrefixUrl(ApiRoutePrefix.discovery) })
  // Get recommendation feed of users
  .get('/recommendations', async ({ headers, query, status }) => {
    try {
      const requester = await requireUser(headers)
      const db = getDrizzleDb()

      const limitNum = query?.limit ? Number(query.limit) : undefined
      const offsetNum = query?.offset ? Number(query.offset) : undefined

      const parsed = v.safeParse(DiscoveryRecommendationsQuerySchema, {
        limit: Number.isFinite(limitNum) ? limitNum : undefined,
        offset: Number.isFinite(offsetNum) ? offsetNum : undefined,
      })

      if (!parsed.success) {
        return status(400, { error: 'Invalid query parameters' })
      }

      const limit = Math.min(parsed.output.limit ?? 50, 100)
      const offset = Math.max(parsed.output.offset ?? 0, 0)

      const recommendations = await getRecommendations(db, requester.id, limit, offset)

      return { data: recommendations }
    } catch (error) {
      const routeError = toRouteError(error, 'Failed to get recommendations')
      return status(routeError.status, routeError.body)
    }
  })
  // Get stronger-ranked possible matches for current user
  .get('/possible-matches', async ({ headers, query, status }) => {
    try {
      const requester = await requireUser(headers)
      const db = getDrizzleDb()

      const limitNum = query?.limit ? Number(query.limit) : undefined
      const offsetNum = query?.offset ? Number(query.offset) : undefined
      const minScoreNum = query?.minScore ? Number(query.minScore) : undefined

      const parsed = v.safeParse(DiscoveryPossibleMatchesQuerySchema, {
        limit: Number.isFinite(limitNum) ? limitNum : undefined,
        minScore: Number.isFinite(minScoreNum) ? minScoreNum : undefined,
        offset: Number.isFinite(offsetNum) ? offsetNum : undefined,
      })

      if (!parsed.success) {
        return status(400, { error: 'Invalid query parameters' })
      }

      const limit = Math.min(parsed.output.limit ?? 20, 100)
      const offset = Math.max(parsed.output.offset ?? 0, 0)
      const minScore = Math.max(parsed.output.minScore ?? 100, 0)

      const matches = await getPossibleMatches(db, requester.id, limit, offset, minScore)

      return { data: matches }
    } catch (error) {
      const routeError = toRouteError(error, 'Failed to get possible matches')
      return status(routeError.status, routeError.body)
    }
  })
  // Get discovery feed of recommended users
  .get('/candidates', async ({ headers, query, status }) => {
    try {
      const requester = await requireUser(headers)
      const db = getDrizzleDb()

      const limitNum = query?.limit ? Number(query.limit) : undefined
      const offsetNum = query?.offset ? Number(query.offset) : undefined

      const parsed = v.safeParse(DiscoveryCandidatesQuerySchema, {
        limit: Number.isFinite(limitNum) ? limitNum : undefined,
        offset: Number.isFinite(offsetNum) ? offsetNum : undefined,
      })

      if (!parsed.success) {
        return status(400, { error: 'Invalid query parameters' })
      }

      const limit = Math.min(parsed.output.limit ?? 50, 100)
      const offset = Math.max(parsed.output.offset ?? 0, 0)

      const candidates = await getDiscoveryFeed(db, requester.id, limit, offset)

      return { data: candidates }
    } catch (error) {
      const routeError = toRouteError(error, 'Failed to get discovery feed')
      return status(routeError.status, routeError.body)
    }
  })

export default discoveryRoutes
