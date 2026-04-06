import { hashPassword } from 'better-auth/crypto'
import { sql } from 'drizzle-orm'
import {
  interestsTable,
  likesTable,
  profilesTable,
  userInterestsTable,
  usersTable,
} from '../db/schema'
import type { TestDB } from './setup'

/**
 * Test fixtures for discovery and matching tests
 */

export async function createUser(db: TestDB, email: string, isVerified = true): Promise<number> {
  await db.insert(usersTable).values({
    email,
    is_approved: 1,
    is_banned: 0,
    is_verified: isVerified ? 1 : 0,
    password_hash: 'test_hash',
    role: 'free',
  })

  const user = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(sql`email = ${email}`)
    .get()

  return user?.id || 0
}

// Backward-compatible helper used by auth tests.
export async function createTestUser(
  db: TestDB,
  email: string,
  password: string,
  role: 'free' | 'premium' | 'admin' = 'free',
  isVerified = true,
): Promise<number> {
  const passwordHash = await hashPassword(password)

  await db.insert(usersTable).values({
    email,
    is_approved: 1,
    is_banned: 0,
    is_verified: isVerified ? 1 : 0,
    password_hash: passwordHash,
    role,
  })

  const user = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(sql`email = ${email}`)
    .get()

  return user?.id || 0
}

export async function createProfile(
  db: TestDB,
  userId: number,
  data: {
    alias: string
    gender: string
    department: string
    intent: 'dating' | 'friendship' | 'networking' | 'study buddy'
    level?: number
    bio?: string
  },
): Promise<void> {
  await db.insert(profilesTable).values({
    alias: data.alias,
    bio: data.bio || '',
    department: data.department,
    full_name: data.alias,
    gender: data.gender,
    intent: data.intent,
    is_id_verified: 0,
    level: data.level || 200,
    user_id: userId,
  })
}

export async function createInterest(db: TestDB, name: string): Promise<number> {
  await db.insert(interestsTable).values({ name })

  const interest = await db
    .select({ id: interestsTable.id })
    .from(interestsTable)
    .where(sql`name = ${name}`)
    .get()

  return interest?.id || 0
}

export async function linkUserInterest(
  db: TestDB,
  userId: number,
  interestId: number,
): Promise<void> {
  await db.insert(userInterestsTable).values({
    interest_id: interestId,
    user_id: userId,
  })
}

export async function createLike(db: TestDB, fromUserId: number, toUserId: number): Promise<void> {
  await db.insert(likesTable).values({
    created_at: new Date().toISOString(),
    from_user_id: fromUserId,
    is_like: 1,
    to_user_id: toUserId,
  })
}

/**
 * Seed test data with predictable users for integration tests.
 */
export async function seedTestUsers(db: TestDB) {
  // Create Alice (CS, dating, coding + hiking interests)
  const alice = await createUser(db, 'alice@student.babcock.edu.ng', true)
  await createProfile(db, alice, {
    alias: 'Alice',
    bio: 'Love coding and hiking',
    department: 'Computer Science',
    gender: 'female',
    intent: 'dating',
    level: 200,
  })
  const coding = await createInterest(db, 'coding')
  const hiking = await createInterest(db, 'hiking')
  await linkUserInterest(db, alice, coding)
  await linkUserInterest(db, alice, hiking)

  // Create Bob (CS, dating, coding + sports interests)
  const bob = await createUser(db, 'bob@student.babcock.edu.ng', true)
  await createProfile(db, bob, {
    alias: 'Bob',
    bio: 'Into sports and tech',
    department: 'Computer Science',
    gender: 'male',
    intent: 'dating',
    level: 200,
  })
  const sports = await createInterest(db, 'sports')
  await linkUserInterest(db, bob, coding)
  await linkUserInterest(db, bob, sports)

  // Create Charlie (Business, networking, tech interests)
  const charlie = await createUser(db, 'charlie@student.babcock.edu.ng', true)
  await createProfile(db, charlie, {
    alias: 'Charlie',
    bio: 'Entrepreneur and mentor',
    department: 'Business',
    gender: 'male',
    intent: 'networking',
    level: 300,
  })
  const tech = await createInterest(db, 'tech')
  await linkUserInterest(db, charlie, tech)

  // Create Diana (CS, friendship, science interests)
  const diana = await createUser(db, 'diana@student.babcock.edu.ng', true)
  await createProfile(db, diana, {
    alias: 'Diana',
    bio: 'Freshman, love science',
    department: 'Computer Science',
    gender: 'female',
    intent: 'friendship',
    level: 100,
  })
  const science = await createInterest(db, 'science')
  await linkUserInterest(db, diana, science)
  await linkUserInterest(db, diana, coding)

  return { alice, bob, charlie, diana, interests: { coding, hiking, science, sports, tech } }
}
