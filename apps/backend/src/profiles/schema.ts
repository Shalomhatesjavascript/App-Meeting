import type { UniversityLevelOutput } from '@repo/shared'
import * as sqlite from 'drizzle-orm/sqlite-core'
import { users } from '../utils/auth/schema'
import { ProfileGenderEnum, ProfileIntentEnum } from './enum'

// TODO: combine this into the user meta data table
export const ProfilesTable = sqlite.sqliteTable('profiles', {
  avatarSeed: sqlite.text({ length: 100 }).notNull().default('default'),

  avatarStyle: sqlite.text({ length: 50 }).notNull().default('notionists'),

  alias: sqlite.text({ length: 50 }).notNull(), // user-facing display name

  bio: sqlite.text(),

  department: sqlite.text({ length: 100 }).notNull(),

  fullName: sqlite.text({ length: 100 }).notNull(), // admin-only, not exposed to users

  gender: sqlite
    .text({
      enum: [...ProfileGenderEnum.$.values()] as [ProfileGenderEnum, ...ProfileGenderEnum[]],
    })
    .notNull(),

  intent: sqlite
    .text({
      enum: [...ProfileIntentEnum.$.values()] as [ProfileIntentEnum, ...ProfileIntentEnum[]],
    })
    .notNull(),

  /** Like school id */
  isIdVerified: sqlite.integer({ mode: 'boolean' }).notNull().default(false),

  level: sqlite.integer().$type<UniversityLevelOutput>().notNull(),

  userId: sqlite
    .text()
    .notNull()
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
})

export type ProfileSelectDB = Readonly<typeof ProfilesTable.$inferSelect>
export type ProfileInsertDB = Readonly<typeof ProfilesTable.$inferInsert>
export type ProfileUpdateDB = Partial<ProfileInsertDB>
