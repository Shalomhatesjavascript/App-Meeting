import type { UniversityLevelOutput } from '@repo/shared'
import * as sqlite from 'drizzle-orm/sqlite-core'
import { users } from '../utils/auth/schema'
import { ProfileGenderEnum, ProfileIntentEnum } from './enum'

// Profiles are stored in a separate `profiles` table for clarity and to keep
// user authentication data (Better Auth) distinct from user-facing profile fields.
// Consider combining into a `user_meta` table in future refactors if schema
// consolidation becomes necessary.
export const ProfilesTable = sqlite.sqliteTable('profiles', {
  alias: sqlite.text({ length: 50 }).notNull(), // user-facing display name
  avatarSeed: sqlite.text({ length: 100 }).notNull().default('default'),

  avatarStyle: sqlite
    .text({
      enum: ['notionists', 'fun-emoji', 'adventurer', 'big-smile', 'lorelei', 'personas'],
      length: 50,
    })
    .notNull()
    .default('notionists'),

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

  /** Whether the user has filled up their profile selection */
  isComplete: sqlite.integer({ mode: 'boolean' }).notNull().default(false),

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
