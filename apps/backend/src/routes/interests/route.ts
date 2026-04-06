import { InterestCreateSchema, InterestUpdateSchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'

import { getDrizzleDb } from '../../db/utils'
import { requireAdmin } from '../../lib/request-auth'
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
  .get('/', async () => {
    const db = getDrizzleDb()
    const interests = await getAllInterests(db)
    return {
      data: interests,
    }
  })
  // Get a specific interest by id
  .get(
    '/:id',
    async ({ params, status }) => {
      const id = Number(params.id)
      if (!Number.isFinite(id)) {
        return status(400, { error: 'Invalid interest id' })
      }

      const db = getDrizzleDb()
      const interest = await getInterestById(db, id)
      if (!interest) {
        return status(404, { error: 'Interest not found' })
      }

      return {
        data: interest,
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
        const message = error instanceof Error ? error.message : 'Failed to create interest'
        return status(message.includes('Admin') ? 403 : 400, { error: message })
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
        const id = Number(params.id)
        if (!Number.isFinite(id)) {
          return status(400, { error: 'Invalid interest id' })
        }
        const db = getDrizzleDb()
        const updated = await updateInterest(db, { ...body, id })
        if (!updated) {
          return status(404, { error: 'Interest not found' })
        }
        return {
          data: updated,
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update interest'
        return status(message.includes('Admin') ? 403 : 400, { error: message })
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
        const id = Number(params.id)
        if (!Number.isFinite(id)) {
          return status(400, { error: 'Invalid interest id' })
        }
        const db = getDrizzleDb()
        await deleteInterest(db, id)
        return { success: true }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete interest'
        return status(message.includes('Admin') ? 403 : 400, { error: message })
      }
    },
    { params: v.object({ id: v.string() }) },
  )

export default interestsRoutes
