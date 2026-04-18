import * as sqlite from 'drizzle-orm/sqlite-core'
import { users } from '../utils/auth/schema'
import { UserMetaRoleEnum } from './enum'

export const UserMetaTable = sqlite.sqliteTable('userMeta', {
  //  createdAt: sqlite
  //   .integer({ mode: 'timestamp_ms' })
  //   .notNull()
  //   .$defaultFn(() => new Date()),

  // /** Only emails ending in `@student.babcock.edu.ng` will be accepted */
  // email: sqlite.text({ length: 255 }).notNull().unique(),

  isApproved: sqlite.integer({ mode: 'boolean' }).notNull().default(false),

  isBanned: sqlite.integer({ mode: 'boolean' }).notNull().default(false),

  isVerified: sqlite.integer({ mode: 'boolean' }).notNull().default(false),

  // In the session table, there's a column that makes this redundant
  // lastLoginAt: sqlite.integer({ mode: 'timestamp_ms' }),

  // password: sqlite.text().notNull(),

  role: sqlite
    .text({ enum: [...UserMetaRoleEnum.$.values()] as [UserMetaRoleEnum, ...UserMetaRoleEnum[]] })
    .notNull()
    .default(UserMetaRoleEnum.Free),

  // updatedAt: sqlite
  //   .integer({ mode: 'timestamp_ms' })
  //   .notNull()
  //   .$defaultFn(() => new Date())
  //   .$onUpdateFn(() => new Date()),

  userId: sqlite
    .text()
    .primaryKey()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
})

export type UserMetaSelectDB = Readonly<typeof UserMetaTable.$inferSelect>
export type UserMetaInsertDB = Readonly<typeof UserMetaTable.$inferInsert>
export type UserMetaUpdateDB = Partial<UserMetaInsertDB>

export type UserSelectDB = Readonly<typeof users.$inferSelect>
export type UserInsertDB = Readonly<typeof users.$inferInsert>
export type UserUpdateDB = Partial<UserInsertDB>

export type UserWithMetaSelectDB = Readonly<{ meta: UserMetaSelectDB; user: UserSelectDB }>
export type UserWithMetaInsertDB = Readonly<{ meta?: UserMetaInsertDB; user?: UserInsertDB }>
export type UserWithMetaUpdateDB = Readonly<{
  meta?: UserMetaUpdateDB
  user?: Pick<UserUpdateDB, 'name' | 'email'>
}>

export type UserMetaAdminActionSelectDB = Pick<UserMetaSelectDB, 'isApproved' | 'isBanned'>
export type UserMetaAdminActionInsertDB = Pick<UserMetaInsertDB, 'isApproved' | 'isBanned'>
