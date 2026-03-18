import { Elysia } from 'elysia'
import * as v from 'valibot'
import {
  SubscriptionCreateSchema,
  SubscriptionUpdateSchema,
  SubscriptionSchema,
} from '@repo/shared'

const subscriptionsRoutes = new Elysia({ prefix: '/subscriptions' })
  // Get all subscriptions (admin or analytics)
  .get(
    '/',
    async () => {
      // Dummy response: array of subscriptions
      return {
        data: [
          {
            id: 1,
            user_id: 1,
            tier: 'free',
            start_date: new Date().toISOString(),
            expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
            payment_ref: 'dummy-payment-ref',
          },
        ],
      }
    }
  )
  // Get current user's subscription
  .get(
    '/me',
    async () => {
      // Dummy response: single subscription
      return {
        data: {
          id: 2,
          user_id: 2,
          tier: 'premium',
          start_date: new Date().toISOString(),
          expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
          payment_ref: 'dummy-payment-ref-2',
        },
      }
    }
  )
  // Get subscription by user_id (admin)
  .get(
    '/:user_id',
    async ({ params }) => {
      // Dummy response: single subscription
      return {
        data: {
          id: 3,
          user_id: Number(params.user_id) || 3,
          tier: 'vip',
          start_date: new Date().toISOString(),
          expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
          payment_ref: 'dummy-payment-ref-3',
        },
      }
    },
    { params: v.object({ user_id: v.string() }) }
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
    { body: SubscriptionCreateSchema }
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
    { params: v.object({ id: v.string() }), body: SubscriptionUpdateSchema }
  )
  // Delete/cancel subscription (admin or user)
  .delete(
    '/:id',
    async ({ params }) => {
      // Dummy response for deletion
      return { success: true }
    },
    { params: v.object({ id: v.string() }) }
  )

export default subscriptionsRoutes
