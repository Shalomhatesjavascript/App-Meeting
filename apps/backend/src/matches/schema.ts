import * as sqlite from 'drizzle-orm/sqlite-core'
import { users } from '../utils/auth/schema'

export const MatchesTable = sqlite.sqliteTable(
  'matches',
  {
    createdAt: sqlite
      .integer({ mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    id: sqlite.integer().primaryKey({ autoIncrement: true }),
    user1Id: sqlite
      .text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    user2Id: sqlite
      .text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (t) => [sqlite.index('user1IdIdx').on(t.user1Id), sqlite.index('user2IdIdx').on(t.user2Id)],
)

export type MatchSelectDB = Readonly<typeof MatchesTable.$inferSelect>
export type MatchInsertDB = Readonly<typeof MatchesTable.$inferInsert>
export type MatchUpdateDB = Partial<MatchInsertDB>
