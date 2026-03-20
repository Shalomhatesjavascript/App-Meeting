import { InterestCreateSchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'

import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'

const userInterestsRoutes = new Elysia({
  prefix: getApiRoutePrefixUrl(ApiRoutePrefix['user-interests']),
})
  // Get all interests for a user
  .get(
    '/:userId',
    async ({ params }) => {
      // Dummy response: array of interests
      return {
        data: [
          {
            name: 'Music',
          },
          {
            name: 'Sports',
          },
        ],
      }
    },
    { params: v.object({ userId: v.string() }) },
  )
  // Add an interest to a user
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
    { body: InterestCreateSchema },
  )
  // Remove an interest from a user
  .delete(
    '/',
    async ({ body }) => {
      // Dummy response for deletion
      return { success: true }
    },
    { body: InterestCreateSchema },
  )

export default userInterestsRoutes
