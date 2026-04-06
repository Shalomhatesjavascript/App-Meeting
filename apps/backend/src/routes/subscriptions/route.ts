import { SubscriptionCreateSchema, SubscriptionUpdateSchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'

import { getDrizzleDb } from '../../db/utils'
import { requireAdmin, requireUser } from '../../lib/request-auth'
import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'
import {
  createSubscription,
  deleteSubscription,
  getSubscriptionById,
  getSubscriptionByUserId,
  listSubscriptions,
  updateSubscription,
} from './model'

const subscriptionsRoutes = new Elysia({
  prefix: getApiRoutePrefixUrl(ApiRoutePrefix.subscriptions),
})
  // Get all subscriptions (admin or analytics)
  .get('/', async ({ headers, status }) => {
    try {
      await requireAdmin(headers)
      const db = getDrizzleDb()
      const subscriptions = await listSubscriptions(db)
      return { data: subscriptions }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list subscriptions'
      return status(message.includes('Admin') ? 403 : 400, { error: message })
    }
  })
  // Get current user's subscription
  .get('/me', async ({ headers, status }) => {
    try {
      const requester = await requireUser(headers)
      const db = getDrizzleDb()
      const subscription = await getSubscriptionByUserId(db, requester.id)
      if (!subscription) {
        return status(404, { error: 'Subscription not found' })
      }
      return { data: subscription }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch subscription'
      return status(401, { error: message })
    }
  })
  // Get subscription by user_id (admin)
  .get(
    '/:user_id',
    async ({ params, headers, status }) => {
      try {
        await requireAdmin(headers)
        const user_id = Number(params.user_id)
        if (!Number.isFinite(user_id)) {
          return status(400, { error: 'Invalid user id' })
        }

        const db = getDrizzleDb()
        const subscription = await getSubscriptionByUserId(db, user_id)
        if (!subscription) {
          return status(404, { error: 'Subscription not found' })
        }
        return {
          data: subscription,
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch subscription'
        return status(message.includes('Admin') ? 403 : 400, { error: message })
      }
    },
    { params: v.object({ user_id: v.string() }) },
  )
  // Create new subscription (user or admin)
  .post(
    '/',
    async ({ body, headers, status }) => {
      try {
        const requester = await requireUser(headers)
        if (requester.role !== 'admin' && requester.id !== body.user_id) {
          return status(403, { error: 'Access denied' })
        }

        const db = getDrizzleDb()
        const created = await createSubscription(db, body)
        return {
          data: created,
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create subscription'
        return status(400, { error: message })
      }
    },
    { body: SubscriptionCreateSchema },
  )
  // Update subscription (upgrade/downgrade/cancel)
  .patch(
    '/:id',
    async ({ params, body, headers, status }) => {
      try {
        const requester = await requireUser(headers)
        const id = Number(params.id)
        if (!Number.isFinite(id)) {
          return status(400, { error: 'Invalid subscription id' })
        }

        const db = getDrizzleDb()
        const existing = await getSubscriptionById(db, id)
        if (!existing) {
          return status(404, { error: 'Subscription not found' })
        }
        if (requester.role !== 'admin' && requester.id !== existing.user_id) {
          return status(403, { error: 'Access denied' })
        }

        const updated = await updateSubscription(db, id, body)
        return {
          data: updated,
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update subscription'
        return status(400, { error: message })
      }
    },
    { body: SubscriptionUpdateSchema, params: v.object({ id: v.string() }) },
  )
  // Delete/cancel subscription (admin or user)
  .delete(
    '/:id',
    async ({ params, headers, status }) => {
      try {
        const requester = await requireUser(headers)
        const id = Number(params.id)
        if (!Number.isFinite(id)) {
          return status(400, { error: 'Invalid subscription id' })
        }

        const db = getDrizzleDb()
        const existing = await getSubscriptionById(db, id)
        if (!existing) {
          return status(404, { error: 'Subscription not found' })
        }
        if (requester.role !== 'admin' && requester.id !== existing.user_id) {
          return status(403, { error: 'Access denied' })
        }

        await deleteSubscription(db, id)
        return { success: true }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete subscription'
        return status(400, { error: message })
      }
    },
    { params: v.object({ id: v.string() }) },
  )

export default subscriptionsRoutes
