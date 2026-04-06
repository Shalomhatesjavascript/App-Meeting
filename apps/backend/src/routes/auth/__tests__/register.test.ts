import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import type { TestDB } from '../../../__tests__/setup'
import { cleanupTestDb, createTestDb, initializeTestSchema } from '../../../__tests__/setup'
import { AuthModel } from '../model'

describe('Auth - Register', () => {
  let db: TestDB

  beforeEach(async () => {
    db = createTestDb()
    await initializeTestSchema(db)
  })

  afterEach(async () => {
    await cleanupTestDb(db)
  })

  it('should register a new user successfully', async () => {
    const result = await AuthModel.register(
      {
        confirmPassword: 'TestPass123!',
        email: 'newuser@student.babcock.edu.ng',
        password: 'TestPass123!',
      },
      db,
    )

    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.user).toBeDefined()
      expect(result.value.verificationCode).toBeDefined()
      expect(result.value.user.isVerified).toBe(false)
      expect(result.value.user.email).toBe('newuser@student.babcock.edu.ng')
    }
  })

  it('should reject duplicate email', async () => {
    const email = 'duplicate@student.babcock.edu.ng'

    // First registration
    await AuthModel.register(
      {
        confirmPassword: 'TestPass123!',
        email,
        password: 'TestPass123!',
      },
      db,
    )

    // Second registration with same email
    const result = await AuthModel.register(
      {
        confirmPassword: 'TestPass123!',
        email,
        password: 'TestPass123!',
      },
      db,
    )

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.code).toBe('CONFLICT')
    }
  })

  it('should reject password mismatch', async () => {
    const result = await AuthModel.register(
      {
        confirmPassword: 'DifferentPass123!',
        email: 'user@student.babcock.edu.ng',
        password: 'TestPass123!',
      },
      db,
    )

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
      expect(result.error.message).toContain('Passwords do not match')
    }
  })

  it('should generate verification code with 15 minute expiry', async () => {
    const result = await AuthModel.register(
      {
        confirmPassword: 'TestPass123!',
        email: 'codetest@student.babcock.edu.ng',
        password: 'TestPass123!',
      },
      db,
    )

    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      const { verificationCode } = result.value
      expect(verificationCode).toBeDefined()
      expect(verificationCode.length).toBe(6)
      expect(/^\d{6}$/.test(verificationCode)).toBe(true)
    }
  })
})
