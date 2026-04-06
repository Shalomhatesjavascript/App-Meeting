import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { eq } from 'drizzle-orm'
import { createTestUser } from '../../../__tests__/fixtures'
import type { TestDB } from '../../../__tests__/setup'
import { cleanupTestDb, createTestDb, initializeTestSchema } from '../../../__tests__/setup'
import { usersTable } from '../../../db/schema'
import { AuthModel } from '../model'

describe('Auth - Login', () => {
  let db: TestDB

  beforeEach(async () => {
    db = createTestDb()
    await initializeTestSchema(db)
  })

  afterEach(async () => {
    await cleanupTestDb(db)
  })

  it('should login verified user successfully', async () => {
    // Create verified user
    await createTestUser(db, 'login@student.babcock.edu.ng', 'TestPass123!', 'free', true)

    const result = await AuthModel.login(
      {
        email: 'login@student.babcock.edu.ng',
        password: 'TestPass123!',
      },
      db,
    )

    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.user).toBeDefined()
      expect(result.value.user.isVerified).toBe(true)
      expect(result.value.token).toBeDefined()
      expect(result.value.token.length).toBeGreaterThan(0)
    }
  })

  it('should reject invalid email', async () => {
    const result = await AuthModel.login(
      {
        email: 'nonexistent@student.babcock.edu.ng',
        password: 'TestPass123!',
      },
      db,
    )

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.code).toBe('AUTHENTICATION_REQUIRED')
      expect(result.error.message).toContain('Invalid email or password')
    }
  })

  it('should reject incorrect password', async () => {
    // Create verified user
    await createTestUser(db, 'wrong@student.babcock.edu.ng', 'TestPass123!', 'free', true)

    const result = await AuthModel.login(
      {
        email: 'wrong@student.babcock.edu.ng',
        password: 'WrongPassword123!',
      },
      db,
    )

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.code).toBe('AUTHENTICATION_REQUIRED')
    }
  })

  it('should reject banned user', async () => {
    // Create a user that we'll manually ban
    const userId = await createTestUser(
      db,
      'banned@student.babcock.edu.ng',
      'TestPass123!',
      'free',
      true,
    )

    // Ban the user by updating the database directly
    await db.update(usersTable).set({ is_banned: 1 }).where(eq(usersTable.id, userId))

    const result = await AuthModel.login(
      {
        email: 'banned@student.babcock.edu.ng',
        password: 'TestPass123!',
      },
      db,
    )

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.code).toBe('FORBIDDEN')
      expect(result.error.message).toContain('suspended')
    }
  })

  it('should return JWT token on successful login', async () => {
    // Create verified user
    await createTestUser(db, 'token@student.babcock.edu.ng', 'TestPass123!', 'free', true)

    const result = await AuthModel.login(
      {
        email: 'token@student.babcock.edu.ng',
        password: 'TestPass123!',
      },
      db,
    )

    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      const { token } = result.value
      // JWT has 3 parts separated by dots
      expect((token.match(/\./g) || []).length).toBe(2)
    }
  })

  it('should update last_login_at on successful login', async () => {
    // Create verified user
    const userId = await createTestUser(
      db,
      'lastlogin@student.babcock.edu.ng',
      'TestPass123!',
      'free',
      true,
    )

    // Get user before login
    const userBefore = await db.select().from(usersTable).where(eq(usersTable.id, userId)).get()
    expect(userBefore).toBeDefined()
    if (!userBefore) {
      throw new Error('Expected seeded user to exist before login')
    }
    expect(userBefore.last_login_at).toBeNull()

    // Login
    const result = await AuthModel.login(
      {
        email: 'lastlogin@student.babcock.edu.ng',
        password: 'TestPass123!',
      },
      db,
    )

    expect(result.isOk()).toBe(true)

    // Get user after login
    const userAfter = await db.select().from(usersTable).where(eq(usersTable.id, userId)).get()
    expect(userAfter).toBeDefined()
    if (!userAfter) {
      throw new Error('Expected user to exist after login')
    }
    expect(userAfter.last_login_at).not.toBeNull()
  })
})
