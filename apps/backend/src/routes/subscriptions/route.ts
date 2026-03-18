import {
  SubscriptionCreateSchema,
  SubscriptionSchema,
  SubscriptionUpdateSchema,
} from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'

import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'

const subscriptionsRoutes = new Elysia({
  prefix: getApiRoutePrefixUrl(ApiRoutePrefix.subscriptions),
})
  // Get all subscriptions (admin or analytics)
  .get('/', async () => {
    // Dummy response: array of subscriptions
    return {
      data: [
        {
          expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
          id: 1,
          payment_ref: 'dummy-payment-ref',
          start_date: new Date().toISOString(),
          tier: 'free',
          user_id: 1,
        },
      ],
    }
  })
  // Get current user's subscription
  .get('/me', async () => {
    // Dummy response: single subscription
    return {
      data: {
        expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        id: 2,
        payment_ref: 'dummy-payment-ref-2',
        start_date: new Date().toISOString(),
        tier: 'premium',
        user_id: 2,
      },
    }
  })
  // Get subscription by user_id (admin)
  .get(
    '/:user_id',
    async ({ params }) => {
      // Dummy response: single subscription
      return {
        data: {
          expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
          id: 3,
          payment_ref: 'dummy-payment-ref-3',
          start_date: new Date().toISOString(),
          tier: 'vip',
          user_id: Number(params.user_id) || 3,
        },
      }
    },
    { params: v.object({ user_id: v.string() }) },
  )
  // Create new subscription (user or admin)
  .post(
    '/',
    async ({ body }) => {
      // Dummy response matching SubscriptionCreateSchema output
      return {
        data: {
          ...body,
          id: 4,
        },
      }
    },
    { body: SubscriptionCreateSchema },
  )
  // Update subscription (upgrade/downgrade/cancel)
  .patch(
    '/:id',
    async ({ params, body }) => {
      // Dummy response matching SubscriptionUpdateSchema output
      return {
        data: {
          ...body,
          id: Number(params.id) || 4,
        },
      }
    },
    { body: SubscriptionUpdateSchema, params: v.object({ id: v.string() }) },
  )
  // Delete/cancel subscription (admin or user)
  .delete(
    '/:id',
    async ({ params }) => {
      // Dummy response for deletion
      return { success: true }
    },
    { params: v.object({ id: v.string() }) },
  )

export default subscriptionsRoutes
