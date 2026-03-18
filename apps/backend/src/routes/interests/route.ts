import { Elysia } from 'elysia'
import * as v from 'valibot'
import { InterestCreateSchema, InterestUpdateSchema } from '@repo/shared'

const interestsRoutes = new Elysia({ prefix: '/interests' })
  // Get all interests
  .get(
    '/',
    async () => {
      // Dummy response: array of interests
      return {
        data: [
          { name: 'Music' },
          { name: 'Sports' },
        ],
      }
    }
  )
  // Get a specific interest by id
  .get(
    '/:id',
    async ({ params }) => {
      // Dummy response: single interest
      return {
        data: {
          id: Number(params.id) || 1,
          name: 'Music',
        },
      }
    },
    { params: v.object({ id: v.string() }) }
  )
  // Create a new interest
  .post(
    '/',
    async ({ body }) => {
      // Dummy response matching InterestCreateSchema output
      return {
        data: {
          ...body,
        },
      }
    },
    { body: InterestCreateSchema }
  )
  // Update an interest
  .put(
    '/:id',
    async ({ params, body }) => {
      // Dummy response matching InterestUpdateSchema output
      return {
        data: {
          ...body,
          id: Number(params.id) || 1,
        },
      }
    },
    { params: v.object({ id: v.string() }), body: InterestUpdateSchema }
  )
  // Delete an interest
  .delete(
    '/:id',
    async ({ params }) => {
      // Dummy response for deletion
      return { success: true }
    },
    { params: v.object({ id: v.string() }) }
  )

export default interestsRoutes
