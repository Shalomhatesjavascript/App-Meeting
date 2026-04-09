import { SubscriptionCreateSchema, SubscriptionUpdateSchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'

import { getDrizzleDb } from '../../db/utils'
import { isSelfOrAdmin } from '../../lib/access-control'
import { parsePositiveInt } from '../../lib/input-parsers'
import { requireAdmin, requireUser } from '../../lib/request-auth'
import { toRouteError } from '../../lib/route-error'
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
      const routeError = toRouteError(error, 'Failed to list subscriptions')
      return status(routeError.status, routeError.body)
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
      const routeError = toRouteError(error, 'Failed to fetch subscription')
      return status(routeError.status, routeError.body)
    }
  })
  // Get subscription by user_id (admin)
  .get(
    '/:user_id',
    async ({ params, headers, status }) => {
      try {
        await requireAdmin(headers)
        const parsed = parsePositiveInt(params.user_id)
        if (!parsed.success) {
          return status(400, { error: 'Invalid user id' })
        }

        const db = getDrizzleDb()
        const subscription = await getSubscriptionByUserId(db, parsed.value)
        if (!subscription) {
          return status(404, { error: 'Subscription not found' })
        }
        return {
          data: subscription,
        }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to fetch subscription')
        return status(routeError.status, routeError.body)
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
        if (!isSelfOrAdmin(requester, body.user_id)) {
          return status(403, { error: 'Access denied' })
        }

        const db = getDrizzleDb()
        const created = await createSubscription(db, body)
        return {
          data: created,
        }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to create subscription')
        return status(routeError.status, routeError.body)
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
        const parsed = parsePositiveInt(params.id)
        if (!parsed.success) {
          return status(400, { error: 'Invalid subscription id' })
        }

        const db = getDrizzleDb()
        const existing = await getSubscriptionById(db, parsed.value)
        if (!existing) {
          return status(404, { error: 'Subscription not found' })
        }
        if (!isSelfOrAdmin(requester, existing.user_id)) {
          return status(403, { error: 'Access denied' })
        }

        const updated = await updateSubscription(db, parsed.value, body)
        return {
          data: updated,
        }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to update subscription')
        return status(routeError.status, routeError.body)
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
        const parsed = parsePositiveInt(params.id)
        if (!parsed.success) {
          return status(400, { error: 'Invalid subscription id' })
        }

        const db = getDrizzleDb()
        const existing = await getSubscriptionById(db, parsed.value)
        if (!existing) {
          return status(404, { error: 'Subscription not found' })
        }
        if (!isSelfOrAdmin(requester, existing.user_id)) {
          return status(403, { error: 'Access denied' })
        }

        await deleteSubscription(db, parsed.value)
        return { success: true }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to delete subscription')
        return status(routeError.status, routeError.body)
      }
    },
    { params: v.object({ id: v.string() }) },
  )

export default subscriptionsRoutes
