import { Elysia } from 'elysia'
import { ApiRoutePrefixEnum } from '../shared/route-prefixes'
import { NumberIdParamsSchema, StringIdParamsSchema } from '../shared/schema'
import { isUserAdmin } from '../user/model'
import { betterAuthRoute } from '../utils/auth'
import { db } from '../utils/db'
import {
  createSubscription,
  deleteSubscription,
  getSubscriptionById,
  getSubscriptionByUserId,
  listSubscriptions,
  updateSubscription,
} from './model'
import { SubscriptionInsertSchema, SubscriptionUpdateSchema } from './validation'

const subscriptionsRoutes = new Elysia({ prefix: ApiRoutePrefixEnum.Subscriptions })
  .use(betterAuthRoute)
  // Get all subscriptions (admin or analytics)
  .get(
    '/',
    async ({ user, status }) => {
      if (!(await isUserAdmin(db, user.id))) {
        return status(403, { error: 'Admin access required' })
      }

      const subscriptions = await listSubscriptions(db)
      return subscriptions
    },
    { auth: true },
  )
  // Get current user's subscription
  .get(
    '/me',
    async ({ user, status }) => {
      const subscription = await getSubscriptionByUserId(db, user.id)
      if (!subscription) {
        return status(404, { error: 'Subscription not found' })
      }
      return subscription
    },
    { auth: true },
  )
  // Get subscription by userId (admin)
  .get(
    '/:id',
    async ({ params, user, status }) => {
      if (!(await isUserAdmin(db, user.id))) {
        return status(403, { error: 'Admin access required' })
      }
      const subscription = await getSubscriptionByUserId(db, params.id)
      if (!subscription) {
        return status(404, { error: 'Subscription not found' })
      }
      return subscription
    },
    { auth: true, params: StringIdParamsSchema },
  )
  // Create new subscription (user or admin)
  .post(
    '/',
    async ({ body, user, status }) => {
      const targetUserId = String(body.userId)
      if (user.id !== targetUserId && !(await isUserAdmin(db, user.id))) {
        return status(403, { error: 'Access denied' })
      }

      const created = await createSubscription(db, body)
      return {
        data: created,
      }
    },
    { auth: true, body: SubscriptionInsertSchema },
  )
  // Update subscription (upgrade/downgrade/cancel)
  .patch(
    '/:id',
    async ({ params: { id }, body, user, status }) => {
      const existing = await getSubscriptionById(db, id)
      if (!existing) {
        return status(404, { error: 'Subscription not found' })
      }
      if (user.id !== String(existing.userId) && !(await isUserAdmin(db, user.id))) {
        return status(403, { error: 'Access denied' })
      }

      const updated = await updateSubscription(db, id, body)
      return {
        data: updated,
      }
    },
    { auth: true, body: SubscriptionUpdateSchema, params: NumberIdParamsSchema },
  )
  // Delete/cancel subscription (admin or user)
  .delete(
    '/:id',
    async ({ params: { id }, user, status }) => {
      const existing = await getSubscriptionById(db, id)
      if (!existing) {
        return status(404, { error: 'Subscription not found' })
      }
      if (user.id !== String(existing.userId) && !(await isUserAdmin(db, user.id))) {
        return status(403, { error: 'Access denied' })
      }

      await deleteSubscription(db, id)
      return { success: true }
    },
    { auth: true, params: NumberIdParamsSchema },
  )

export default subscriptionsRoutes
