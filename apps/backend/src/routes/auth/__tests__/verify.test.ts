import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { createTestUser } from '../../../__tests__/fixtures'
import type { TestDB } from '../../../__tests__/setup'
import { cleanupTestDb, createTestDb, initializeTestSchema } from '../../../__tests__/setup'
import { AuthModel } from '../model'

describe('Auth - Verify', () => {
  let db: TestDB

  beforeEach(async () => {
    db = createTestDb()
    await initializeTestSchema(db)
  })

  afterEach(async () => {
    await cleanupTestDb(db)
  })

  it('should verify email with valid code', async () => {
    // Register
    const registerResult = await AuthModel.register(
      {
        confirmPassword: 'TestPass123!',
        email: 'verify@student.babcock.edu.ng',
        password: 'TestPass123!',
      },
      db,
    )

    expect(registerResult.isOk()).toBe(true)
    let verificationCode = ''
    if (registerResult.isOk()) {
      verificationCode = registerResult.value.verificationCode
    }

    // Verify with correct code
    const verifyResult = await AuthModel.verify(
      {
        code: verificationCode,
        email: 'verify@student.babcock.edu.ng',
      },
      db,
    )

    expect(verifyResult.isOk()).toBe(true)
    if (verifyResult.isOk()) {
      expect(verifyResult.value.user.isVerified).toBe(true)
      expect(verifyResult.value.token).toBeDefined()
      expect(verifyResult.value.token.length).toBeGreaterThan(0)
    }
  })

  it('should accept demo code 123456', async () => {
    // Create unverified user
    await createTestUser(db, 'demo@student.babcock.edu.ng', 'TestPass123!', 'free', false)

    const verifyResult = await AuthModel.verify(
      {
        code: '123456',
        email: 'demo@student.babcock.edu.ng',
      },
      db,
    )

    expect(verifyResult.isOk()).toBe(true)
    if (verifyResult.isOk()) {
      expect(verifyResult.value.user.isVerified).toBe(true)
      expect(verifyResult.value.token).toBeDefined()
    }
  })

  it('should reject invalid verification code', async () => {
    // Register
    const registerResult = await AuthModel.register(
      {
        confirmPassword: 'TestPass123!',
        email: 'invalid@student.babcock.edu.ng',
        password: 'TestPass123!',
      },
      db,
    )

    expect(registerResult.isOk()).toBe(true)

    // Try verify with wrong code
    const verifyResult = await AuthModel.verify(
      {
        code: '000000',
        email: 'invalid@student.babcock.edu.ng',
      },
      db,
    )

    expect(verifyResult.isErr()).toBe(true)
    if (verifyResult.isErr()) {
      expect(verifyResult.error.code).toBe('VALIDATION_ERROR')
      expect(verifyResult.error.message).toContain('Invalid verification code')
    }
  })

  it('should reject verification for non-existent user', async () => {
    const verifyResult = await AuthModel.verify(
      {
        code: '123456',
        email: 'nonexistent@student.babcock.edu.ng',
      },
      db,
    )

    expect(verifyResult.isErr()).toBe(true)
    if (verifyResult.isErr()) {
      expect(verifyResult.error.code).toBe('NOT_FOUND')
    }
  })

  it('should return token on successful verification', async () => {
    // Register
    const registerResult = await AuthModel.register(
      {
        confirmPassword: 'TestPass123!',
        email: 'token@student.babcock.edu.ng',
        password: 'TestPass123!',
      },
      db,
    )

    let verificationCode = ''
    if (registerResult.isOk()) {
      verificationCode = registerResult.value.verificationCode
    }

    // Verify
    const verifyResult = await AuthModel.verify(
      {
        code: verificationCode,
        email: 'token@student.babcock.edu.ng',
      },
      db,
    )

    expect(verifyResult.isOk()).toBe(true)
    if (verifyResult.isOk()) {
      expect(verifyResult.value.token).toBeDefined()
      // Token should be a JWT string (3 parts separated by dots)
      expect((verifyResult.value.token.match(/\./g) || []).length).toBe(2)
    }
  })
})
