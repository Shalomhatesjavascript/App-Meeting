import { Database } from 'bun:sqlite'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/bun-sqlite'

export type TestDB = ReturnType<typeof drizzle>

/**
 * Create an isolated in-memory SQLite database for testing.
 * Each test gets its own DB instance.
 */
export function createTestDb(): TestDB {
  const sqlite = new Database(':memory:')
  const db = drizzle(sqlite)
  return db
}

/**
 * Initialize schema on test database.
 */
export async function initializeTestSchema(db: TestDB): Promise<void> {
  // Create all tables using raw SQL
  const tableDefinitions = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('free', 'premium', 'admin')),
      is_verified INTEGER NOT NULL DEFAULT 0,
      is_banned INTEGER NOT NULL DEFAULT 0,
      is_approved INTEGER NOT NULL DEFAULT 0,
      last_login_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS profiles (
      user_id INTEGER PRIMARY KEY,
      full_name TEXT NOT NULL,
      alias TEXT NOT NULL,
      gender TEXT NOT NULL,
      department TEXT NOT NULL,
      level INTEGER NOT NULL,
      bio TEXT,
      intent TEXT NOT NULL CHECK (intent IN ('dating', 'friendship', 'networking', 'study buddy')),
      is_id_verified INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS interests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )`,
    `CREATE TABLE IF NOT EXISTS user_interests (
      user_id INTEGER NOT NULL,
      interest_id INTEGER NOT NULL,
      PRIMARY KEY (user_id, interest_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER NOT NULL,
      is_like INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user1_id INTEGER NOT NULL,
      user2_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      tier TEXT NOT NULL CHECK (tier IN ('free', 'premium', 'vip')),
      start_date TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      payment_ref TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS admin_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      target_user_id INTEGER,
      timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
  ]

  // SQLite via better-sqlite3 driver
  for (const definition of tableDefinitions) {
    await db.run(sql.raw(definition))
  }
}

/**
 * Clean up test database by truncating all tables.
 */
export async function cleanupTestDb(db: TestDB): Promise<void> {
  // Delete in reverse dependency order (respect foreign keys)
  const tables = [
    'messages',
    'matches',
    'likes',
    'admin_logs',
    'subscriptions',
    'user_interests',
    'profiles',
    'interests',
    'users',
  ]

  for (const table of tables) {
    try {
      await db.run(sql.raw(`DELETE FROM ${table}`))
    } catch {
      // Table might not exist, continue
    }
  }
}

/**
 * Helper to validate a TestDB for use with production code expecting a DB type.
 *
 * ## Type Safety Note
 *
 * TestDB (BunSQLiteDatabase) and DB (DrizzleD1Database) have incompatible types:
 * D1 includes methods like `batch()` that SQLite doesn't have. However, Drizzle's core
 * APIs (select, insert, update, delete, query) work identically across both backends.
 *
 * This helper uses a type predicate to safely cast TestDB → DB for functions that only
 * use the common Drizzle APIs. Use only for test fixtures that don't call D1-specific methods.
 *
 * @param db The TestDB instance to validate
 * @returns The same DB instance, typed as the production DB type
 * @throws Never - this is a pure type cast with no runtime validation
 *
 * @example
 * ```ts
 * const testDb = createTestDb()
 * const db = asProductionDB(testDb)
 * const result = await queryFunction(db) // Now TypeScript is satisfied
 * ```
 */
export function asProductionDB(db: TestDB) {
  return db as unknown as import('../db/utils').DB
}
