import { eq } from 'drizzle-orm'
import type { DB } from '../utils/db'
import {
  type SubscriptionInsertDB,
  type SubscriptionSelectDB,
  SubscriptionsTable,
  type SubscriptionUpdateDB,
} from './schema'

/**
 * Subscriptions Model
 * Handles DB operations for subscriptions.
 * Validation schemas are imported from the shared package.
 */

// Validate and create a new subscription
export async function createSubscription(
  db: DB,
  payload: SubscriptionInsertDB,
): Promise<SubscriptionSelectDB | undefined> {
  return db.insert(SubscriptionsTable).values(payload).returning().get()
}

// Update a subscription by id
export async function updateSubscription(
  db: DB,
  id: number,
  payload: SubscriptionUpdateDB,
): Promise<SubscriptionSelectDB | undefined> {
  return db
    .update(SubscriptionsTable)
    .set(payload)
    .where(eq(SubscriptionsTable.id, id))
    .returning()
    .get()
}

export async function getSubscriptionByUserId(db: DB, userId: string) {
  return db.select().from(SubscriptionsTable).where(eq(SubscriptionsTable.userId, userId)).get()
}

export async function getSubscriptionById(db: DB, id: number) {
  return db.select().from(SubscriptionsTable).where(eq(SubscriptionsTable.id, id)).get()
}

export async function listSubscriptions(db: DB) {
  return db.select().from(SubscriptionsTable).all()
}

export async function deleteSubscription(db: DB, id: number) {
  return db.delete(SubscriptionsTable).where(eq(SubscriptionsTable.id, id)).run()
}
