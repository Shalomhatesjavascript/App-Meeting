import { InterestCreateSchema, InterestUpdateSchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'

import { getDrizzleDb } from '../../db/utils'
import { parsePositiveInt } from '../../lib/input-parsers'
import { requireAdmin } from '../../lib/request-auth'
import { toRouteError } from '../../lib/route-error'
import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'
import {
  createInterest,
  deleteInterest,
  getAllInterests,
  getInterestById,
  updateInterest,
} from './model'

const interestsRoutes = new Elysia({ prefix: getApiRoutePrefixUrl(ApiRoutePrefix.interests) })
  // Get all interests
  .get('/', async ({ status }) => {
    try {
      const db = getDrizzleDb()
      const interests = await getAllInterests(db)
      return {
        data: interests,
      }
    } catch (error) {
      const routeError = toRouteError(error, 'Failed to list interests')
      return status(routeError.status, routeError.body)
    }
  })
  // Get a specific interest by id
  .get(
    '/:id',
    async ({ params, status }) => {
      try {
        const parsed = parsePositiveInt(params.id)
        if (!parsed.success) {
          return status(400, { error: 'Invalid interest id' })
        }

        const db = getDrizzleDb()
        const interest = await getInterestById(db, parsed.value)
        if (!interest) {
          return status(404, { error: 'Interest not found' })
        }

        return {
          data: interest,
        }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to fetch interest')
        return status(routeError.status, routeError.body)
      }
    },
    { params: v.object({ id: v.string() }) },
  )
  // Create a new interest
  .post(
    '/',
    async ({ body, headers, status }) => {
      try {
        await requireAdmin(headers)
        const db = getDrizzleDb()
        const created = await createInterest(db, body)
        return {
          data: created,
        }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to create interest')
        return status(routeError.status, routeError.body)
      }
    },
    { body: InterestCreateSchema },
  )
  // Update an interest
  .put(
    '/:id',
    async ({ params, body, headers, status }) => {
      try {
        await requireAdmin(headers)
        const parsed = parsePositiveInt(params.id)
        if (!parsed.success) {
          return status(400, { error: 'Invalid interest id' })
        }
        const db = getDrizzleDb()
        const updated = await updateInterest(db, { ...body, id: parsed.value })
        if (!updated) {
          return status(404, { error: 'Interest not found' })
        }
        return {
          data: updated,
        }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to update interest')
        return status(routeError.status, routeError.body)
      }
    },
    { body: InterestUpdateSchema, params: v.object({ id: v.string() }) },
  )
  // Delete an interest
  .delete(
    '/:id',
    async ({ params, headers, status }) => {
      try {
        await requireAdmin(headers)
        const parsed = parsePositiveInt(params.id)
        if (!parsed.success) {
          return status(400, { error: 'Invalid interest id' })
        }
        const db = getDrizzleDb()
        await deleteInterest(db, parsed.value)
        return { success: true }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to delete interest')
        return status(routeError.status, routeError.body)
      }
    },
    { params: v.object({ id: v.string() }) },
  )

export default interestsRoutes
