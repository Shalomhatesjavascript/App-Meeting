import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const usersTable = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  /** Only emails ending in `@student.babcock.edu.ng` will be accepted */
  email: text('email', { length: 255 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: text('role', { enum: ['free', 'premium', 'admin'] }).notNull(),
  is_verified: integer('is_verified').notNull().default(0),
  is_banned: integer('is_banned').notNull().default(0), // 0 = not banned, 1 = banned
  is_approved: integer('is_approved').notNull().default(0), // 0 = not approved, 1 = approved
  last_login_at: text('last_login_at'), // nullable, set on login
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
})

export const profilesTable = sqliteTable('profiles', {
  user_id: integer('user_id')
    .primaryKey()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  full_name: text('full_name', { length: 100 }).notNull(), // admin-only, not exposed to users
  alias: text('alias', { length: 50 }).notNull(), // user-facing display name
  gender: text('gender', { length: 20 }).notNull(),
  department: text('department', { length: 100 }).notNull(),
  level: integer('level').notNull(),
  bio: text('bio'),
  intent: text('intent', {
    enum: ['dating', 'friendship', 'networking', 'study buddy'],
  }).notNull(),
  // SQLite does not have a native boolean type; use integer (0 = false, 1 = true)
  is_id_verified: integer('is_id_verified').notNull().default(0),
})

export const interestsTable = sqliteTable('interests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name', { length: 50 }).notNull().unique(),
})

export const userInterestsTable = sqliteTable(
  'user_interests',
  {
    user_id: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    interest_id: integer('interest_id')
      .notNull()
      .references(() => interestsTable.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.user_id, table.interest_id] }),
  }),
)

export const likesTable = sqliteTable('likes', {
  id: integer('id').primaryKey({ autoIncrement: true }), // BIGSERIAL
  from_user_id: integer('from_user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  to_user_id: integer('to_user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  // SQLite does not have a native boolean type; use integer (0 = false, 1 = true)
  is_like: integer('is_like').notNull(),
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
})

export const matchesTable = sqliteTable('matches', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user1_id: integer('user1_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  user2_id: integer('user2_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
})

export const messagesTable = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }), // BIGSERIAL
  match_id: integer('match_id')
    .notNull()
    .references(() => matchesTable.id, { onDelete: 'cascade' }),
  sender_id: integer('sender_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  is_read: integer('is_read').notNull().default(0),
  created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
})

export const subscriptionsTable = sqliteTable('subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  tier: text('tier', { enum: ['free', 'premium', 'vip'] }).notNull(),
  start_date: text('start_date').notNull(),
  expiry_date: text('expiry_date').notNull(),
  payment_ref: text('payment_ref', { length: 100 }).notNull(),
})

export const adminLogsTable = sqliteTable('admin_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }), // BIGSERIAL
  admin_id: integer('admin_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  action: text('action', { length: 255 }).notNull(),
  target_user_id: integer('target_user_id').references(() => usersTable.id, {
    onDelete: 'set null',
  }),
  timestamp: text('timestamp').notNull().default('CURRENT_TIMESTAMP'),
})
