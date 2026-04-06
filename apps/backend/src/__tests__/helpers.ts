import type { Result } from 'neverthrow'
import type { AuthFailure } from '../routes/auth/model'

/**
 * Assert that a Result is Ok.
 */
export function expectSuccess<T>(result: Result<T, unknown>): T {
  if (!result.isOk()) {
    throw new Error(`Expected success but got error: ${JSON.stringify(result.error)}`)
  }
  return result.value
}

/**
 * Assert that a Result is Err with a specific code.
 */
export function expectError<T>(result: Result<T, AuthFailure>, expectedCode: string): AuthFailure {
  if (!result.isErr()) {
    throw new Error(`Expected error with code ${expectedCode} but got success`)
  }
  if (result.error.code !== expectedCode) {
    throw new Error(
      `Expected error code ${expectedCode} but got ${result.error.code}: ${result.error.message}`,
    )
  }
  return result.error
}

/**
 * Create a mock getDrizzleDb function for dependency injection in tests.
 */
export function createMockGetDrizzleDb<T>(testDb: T): () => T {
  return () => testDb
}
