import * as sqlite from 'drizzle-orm/sqlite-core'
import { MatchesTable } from '../matches/schema'
import { UserMetaTable } from '../user/schema'
import { users } from '../utils/auth/schema'

export const MessageTable = sqlite.sqliteTable(
  'messages',
  {
    content: sqlite.text().notNull(),
    createdAt: sqlite
      .integer({ mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    id: sqlite.integer().primaryKey({ autoIncrement: true }),
    isRead: sqlite.integer({ mode: 'boolean' }).notNull().default(false),
    // Since a user can only chat with matched users
    matchId: sqlite
      .integer()
      .notNull()
      .references(() => MatchesTable.id, { onDelete: 'cascade' }),
    senderId: sqlite
      .text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (t) => [sqlite.index('matchIdIdx').on(t.matchId), sqlite.index('senderId').on(t.senderId)],
)

export type MessageInsertDB = Readonly<typeof MessageTable.$inferInsert>
export type MessageSelectDB = Readonly<typeof MessageTable.$inferSelect>
export type MessageUpdateDB = Partial<MessageInsertDB>
