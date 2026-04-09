import {
  DiscoveryCandidatesQuerySchema,
  DiscoveryPossibleMatchesQuerySchema,
  DiscoveryRecommendationsQuerySchema,
} from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'
import { getDrizzleDb } from '../../db/utils'
import { parseNonNegativeInt, parsePositiveInt } from '../../lib/input-parsers'
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

      const parsedLimit = query?.limit ? parsePositiveInt(query.limit) : null
      const parsedOffset = query?.offset ? parseNonNegativeInt(query.offset) : null
      if (parsedLimit && !parsedLimit.success) {
        return status(400, { error: 'Invalid query parameters' })
      }
      if (parsedOffset && !parsedOffset.success) {
        return status(400, { error: 'Invalid query parameters' })
      }

      const parsed = v.safeParse(DiscoveryRecommendationsQuerySchema, {
        limit: parsedLimit?.success ? parsedLimit.value : undefined,
        offset: parsedOffset?.success ? parsedOffset.value : undefined,
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

      const parsedLimit = query?.limit ? parsePositiveInt(query.limit) : null
      const parsedOffset = query?.offset ? parseNonNegativeInt(query.offset) : null
      const parsedMinScore = query?.minScore ? parseNonNegativeInt(query.minScore) : null
      if (parsedLimit && !parsedLimit.success) {
        return status(400, { error: 'Invalid query parameters' })
      }
      if (parsedOffset && !parsedOffset.success) {
        return status(400, { error: 'Invalid query parameters' })
      }
      if (parsedMinScore && !parsedMinScore.success) {
        return status(400, { error: 'Invalid query parameters' })
      }

      const parsed = v.safeParse(DiscoveryPossibleMatchesQuerySchema, {
        limit: parsedLimit?.success ? parsedLimit.value : undefined,
        minScore: parsedMinScore?.success ? parsedMinScore.value : undefined,
        offset: parsedOffset?.success ? parsedOffset.value : undefined,
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

      const parsedLimit = query?.limit ? parsePositiveInt(query.limit) : null
      const parsedOffset = query?.offset ? parseNonNegativeInt(query.offset) : null
      if (parsedLimit && !parsedLimit.success) {
        return status(400, { error: 'Invalid query parameters' })
      }
      if (parsedOffset && !parsedOffset.success) {
        return status(400, { error: 'Invalid query parameters' })
      }

      const parsed = v.safeParse(DiscoveryCandidatesQuerySchema, {
        limit: parsedLimit?.success ? parsedLimit.value : undefined,
        offset: parsedOffset?.success ? parsedOffset.value : undefined,
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
