import type { SubscriptionCreateInput, SubscriptionUpdateInput } from '@repo/shared'
import { eq } from 'drizzle-orm'
import { subscriptionsTable } from '../../db/schema'
import type { DB } from '../../db/utils'

/**
 * Subscriptions Model
 * Handles DB operations for subscriptions.
 * Validation schemas are imported from the shared package.
 */

// Validate and create a new subscription
export async function createSubscription(db: DB, payload: SubscriptionCreateInput) {
  const [created] = await db.insert(subscriptionsTable).values(payload).returning()
  return created
}

// Update a subscription by id
export async function updateSubscription(db: DB, id: number, payload: SubscriptionUpdateInput) {
  const { id: _id, ...updatePayload } = { ...payload, id }

  const [updated] = await db
    .update(subscriptionsTable)
    .set(updatePayload)
    .where(eq(subscriptionsTable.id, id))
    .returning()
  return updated
}

export async function getSubscriptionByUserId(db: DB, user_id: number) {
  return db.select().from(subscriptionsTable).where(eq(subscriptionsTable.user_id, user_id)).get()
}

export async function getSubscriptionById(db: DB, id: number) {
  return db.select().from(subscriptionsTable).where(eq(subscriptionsTable.id, id)).get()
}

export async function listSubscriptions(db: DB) {
  return db.select().from(subscriptionsTable).all()
}

export async function deleteSubscription(db: DB, id: number) {
  return db.delete(subscriptionsTable).where(eq(subscriptionsTable.id, id)).run()
}
