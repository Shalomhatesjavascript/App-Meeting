import * as sqlite from 'drizzle-orm/sqlite-core'
import { users } from '../utils/auth/schema'

export const AdminLogTable = sqlite.sqliteTable(
  'adminLogs',
  {
    action: sqlite.text({ length: 255 }).notNull(),
    adminId: sqlite
      .text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: sqlite
      .integer({ mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    id: sqlite.integer().primaryKey({ autoIncrement: true }),
    targetUserId: sqlite.text().references(() => users.id, { onDelete: 'set null' }),
  },
  (t) => [sqlite.index('targetUserIdIdx').on(t.targetUserId)],
)

export type AdminLogSelectDB = Readonly<typeof AdminLogTable.$inferSelect>
export type AdminLogInsertDB = Readonly<typeof AdminLogTable.$inferInsert>
export type AdminLogUpdateDB = Partial<AdminLogInsertDB>
