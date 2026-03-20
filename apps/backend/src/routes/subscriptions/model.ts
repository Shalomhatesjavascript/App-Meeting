import {
  type SubscriptionCreateInput,
  SubscriptionCreateSchema,
  type SubscriptionUpdateInput,
  SubscriptionUpdateSchema,
} from '@repo/shared'
import { eq } from 'drizzle-orm'
import * as v from 'valibot'
import { subscriptionsTable } from '../../db/schema'
import type { DB } from '../../db/utils'

/**
 * Subscriptions Model
 * Handles DB operations for subscriptions.
 * Validation schemas are imported from the shared package.
 */

// Validate and create a new subscription
export async function createSubscription(db: DB, payload: SubscriptionCreateInput) {
  const result = v.safeParse(SubscriptionCreateSchema, payload)
  if (!result.success) {
    throw new Error(`Validation failed: ${JSON.stringify(result.issues)}`)
  }

  const [created] = await db.insert(subscriptionsTable).values(result.output).returning()
  return created
}

// Update a subscription by id
export async function updateSubscription(db: DB, id: number, payload: SubscriptionUpdateInput) {
  const result = v.safeParse(SubscriptionUpdateSchema, { ...payload, id })
  if (!result.success) {
    throw new Error(`Validation failed: ${JSON.stringify(result.issues)}`)
  }

  const [updated] = await db
    .update(subscriptionsTable)
    .set(result.output)
    .where(eq(subscriptionsTable.id, id))
    .returning()
  return updated
}

export async function getSubscriptionByUserId(db: DB, user_id: number) {
  return db.select().from(subscriptionsTable).where(eq(subscriptionsTable.user_id, user_id)).all()
}

export async function deleteSubscription(db: DB, id: number) {
  return db.delete(subscriptionsTable).where(eq(subscriptionsTable.id, id)).run()
}
