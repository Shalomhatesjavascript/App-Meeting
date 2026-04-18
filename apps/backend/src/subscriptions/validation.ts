import { createInsertSchema, createUpdateSchema } from 'drizzle-valibot'
import { SubscriptionsTable } from './schema'

export const SubscriptionInsertSchema = createInsertSchema(SubscriptionsTable)

export const SubscriptionUpdateSchema = createUpdateSchema(SubscriptionsTable)
