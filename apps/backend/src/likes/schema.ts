import { eq, not } from 'drizzle-orm'
import * as sqlite from 'drizzle-orm/sqlite-core'
import { users } from '../utils/auth/schema'

export const LikesTable = sqlite.sqliteTable(
  'likes',
  {
    createdAt: sqlite
      .integer({ mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    fromUserId: sqlite
      .text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    id: sqlite.integer().primaryKey({ autoIncrement: true }),
    isLike: sqlite.integer({ mode: 'boolean' }).notNull(),
    toUserId: sqlite
      .text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    // A user shouldn't be able to like themselves?
    sqlite.check('fromUserIdNotEqualWithToUserId', not(eq(table.fromUserId, table.toUserId))),

    sqlite.index('fromUserIdIdx').on(table.fromUserId),
    sqlite.index('toUserIdx').on(table.toUserId),
  ],
)

export type LikeSelectDB = Readonly<typeof LikesTable.$inferSelect>
export type LikeInsertDB = Readonly<typeof LikesTable.$inferInsert>
export type LikeUpdateDB = Partial<LikeInsertDB>
