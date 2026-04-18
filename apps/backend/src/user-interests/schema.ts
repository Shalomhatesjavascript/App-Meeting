import * as sqlite from 'drizzle-orm/sqlite-core'
import { InterestsTable } from '../interests/schema'
import { users } from '../utils/auth/schema'

export const UserInterestsTable = sqlite.sqliteTable(
  'userInterests',
  {
    interestId: sqlite
      .integer()
      .notNull()
      .references(() => InterestsTable.id, { onDelete: 'cascade' }),
    userId: sqlite
      .text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [sqlite.primaryKey({ columns: [table.userId, table.interestId] })],
)

export type UserInterestSelectDB = Readonly<typeof UserInterestsTable.$inferSelect>
export type UserInterestInsertDB = Readonly<typeof UserInterestsTable.$inferInsert>
export type UserInterestUpdateDB = Partial<UserInterestInsertDB>
