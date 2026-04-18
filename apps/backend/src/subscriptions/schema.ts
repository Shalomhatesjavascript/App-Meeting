import * as sqlite from 'drizzle-orm/sqlite-core'
import { users } from '../utils/auth/schema'
import { SubscriptionTierEnum } from './enum'

export const SubscriptionsTable = sqlite.sqliteTable('subscriptions', {
  expiryDate: sqlite.integer({ mode: 'timestamp_ms' }).notNull(),
  id: sqlite.integer().primaryKey({ autoIncrement: true }),
  paymentRef: sqlite.text().notNull(),
  startDate: sqlite
    .integer({ mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  tier: sqlite
    .text({
      enum: [...SubscriptionTierEnum.$.values()] as [
        SubscriptionTierEnum,
        ...SubscriptionTierEnum[],
      ],
    })
    .notNull(),
  userId: sqlite
    .text()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
})

export type SubscriptionSelectDB = Readonly<typeof SubscriptionsTable.$inferSelect>
export type SubscriptionInsertDB = Readonly<typeof SubscriptionsTable.$inferInsert>
export type SubscriptionUpdateDB = Partial<SubscriptionInsertDB>
