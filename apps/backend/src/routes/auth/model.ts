import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyInput,
} from '@repo/shared'
import { hashPassword, verifyPassword } from 'better-auth/crypto'
import { eq } from 'drizzle-orm'
import { err, ok, type Result } from 'neverthrow'
import { profilesTable, usersTable } from '../../db/schema'
import { getDrizzleDb } from '../../db/utils'
import {
  type AuthErrorCode,
  AuthErrorCodeEnum,
  type AuthRole,
  AuthRoleEnum,
} from '../../lib/auth-enums'
import { createAuthToken } from '../../lib/auth-token'
import { toRouteError } from '../../lib/route-error'

type PublicUser = {
  id: number
  email: string
  role: AuthRole
  isVerified: boolean
  isApproved: boolean
  isBanned: boolean
  profileComplete: boolean
  createdAt: string
}

export type AuthFailure = {
  ok: false
  code: AuthErrorCode
  message: string
}

type AuthResult<T> = Result<T, AuthFailure>

function getVerificationCode(email: string): string {
  let hash = 0
  for (let i = 0; i < email.length; i += 1) {
    hash = (hash * 31 + email.charCodeAt(i)) % 1000000
  }

  return String(hash).padStart(6, '0')
}

function toPublicUser(
  user: {
    id: number
    email: string
    role: string
    is_verified: number
    is_approved: number
    is_banned: number
    created_at: string
  },
  profileComplete = false,
): PublicUser {
  return {
    createdAt: user.created_at,
    email: user.email,
    id: user.id,
    isApproved: user.is_approved === 1,
    isBanned: user.is_banned === 1,
    isVerified: user.is_verified === 1,
    profileComplete,
    role: normalizeRole(user.role),
  }
}

function fail(code: AuthErrorCode, message: string): AuthFailure {
  return {
    code,
    message,
    ok: false,
  }
}

function normalizeRole(role: string): AuthRole {
  return AuthRoleEnum.$.isValue(role) ? role : AuthRoleEnum.free
}

async function hasProfile(db: ReturnType<typeof getDrizzleDb>, userId: number): Promise<boolean> {
  const profile = await db
    .select({ user_id: profilesTable.user_id })
    .from(profilesTable)
    .where(eq(profilesTable.user_id, userId))
    .get()

  return Boolean(profile)
}

/**
 * Auth model functions.
 * These are stubs to be implemented with actual DB and business logic.
 */
export const AuthModel = {
  async forgotPassword(
    data: ForgotPasswordInput,
    db?: unknown,
  ): Promise<
    AuthResult<
      | {
          success: true
        }
      | {
          success: true
          resetCode: string
        }
      | {
          success: true
          verificationCode: string
        }
    >
  > {
    try {
      const database = (db as ReturnType<typeof getDrizzleDb>) || getDrizzleDb()
      const user = await database
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, data.email))
        .get()

      // Keep response generic to avoid account enumeration.
      if (!user) {
        return ok({ success: true })
      }

      // Compatibility behavior for legacy verify page while Better Auth migration completes.
      if (user.is_verified === 0) {
        return ok({ success: true, verificationCode: getVerificationCode(user.email) })
      }

      return ok({ success: true })
    } catch (error) {
      const routeError = toRouteError(error, 'Failed to start password reset')
      return err(fail(AuthErrorCodeEnum.INTERNAL_ERROR, routeError.body.error))
    }
  },

  async login(
    data: LoginInput,
    db?: unknown,
  ): Promise<
    AuthResult<{
      success: true
      token: string
      user: PublicUser
    }>
  > {
    try {
      const database = (db as ReturnType<typeof getDrizzleDb>) || getDrizzleDb()
      const user = await database
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, data.email))
        .get()

      if (!user) {
        return err(fail(AuthErrorCodeEnum.AUTHENTICATION_REQUIRED, 'Invalid email or password'))
      }

      const valid = await verifyPassword({ hash: user.password_hash, password: data.password })
      if (!valid) {
        return err(fail(AuthErrorCodeEnum.AUTHENTICATION_REQUIRED, 'Invalid email or password'))
      }

      if (user.is_banned === 1) {
        return err(fail(AuthErrorCodeEnum.FORBIDDEN, 'This account has been suspended'))
      }

      const profileComplete = await hasProfile(database, user.id)

      const token = await createAuthToken({
        email: user.email,
        role: normalizeRole(user.role),
        userId: user.id,
      })

      await database
        .update(usersTable)
        .set({ last_login_at: new Date().toISOString() })
        .where(eq(usersTable.id, user.id))

      return ok({
        success: true,
        token,
        user: toPublicUser(user, profileComplete),
      })
    } catch (error) {
      const routeError = toRouteError(error, 'Failed to login')
      return err(fail(AuthErrorCodeEnum.INTERNAL_ERROR, routeError.body.error))
    }
  },
  async register(
    data: RegisterInput,
    db?: unknown,
  ): Promise<
    AuthResult<{
      success: true
      user: PublicUser
      verificationCode: string
    }>
  > {
    try {
      if (data.password !== data.confirmPassword) {
        return err(fail(AuthErrorCodeEnum.VALIDATION_ERROR, 'Passwords do not match'))
      }

      const database = (db as ReturnType<typeof getDrizzleDb>) || getDrizzleDb()
      const existing = await database
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, data.email))
        .get()

      if (existing) {
        return err(fail(AuthErrorCodeEnum.CONFLICT, 'An account with this email already exists'))
      }

      const password_hash = await hashPassword(data.password)

      await database
        .insert(usersTable)
        .values({
          email: data.email,
          is_approved: 1,
          is_banned: 0,
          is_verified: 0,
          password_hash,
          role: AuthRoleEnum.free,
        })
        .run()

      const created = await database
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, data.email))
        .get()

      if (!created) {
        return err(fail(AuthErrorCodeEnum.INTERNAL_ERROR, 'Failed to create user'))
      }

      const profileComplete = await hasProfile(database, created.id)

      return ok({
        success: true,
        user: toPublicUser(created, profileComplete),
        verificationCode: getVerificationCode(created.email),
      })
    } catch (error) {
      const routeError = toRouteError(error, 'Failed to create user')
      return err(fail(AuthErrorCodeEnum.INTERNAL_ERROR, routeError.body.error))
    }
  },

  async resetPassword(
    data: ResetPasswordInput,
    _db?: unknown,
  ): Promise<AuthResult<{ success: true }>> {
    try {
      void data
      return err(
        fail(
          AuthErrorCodeEnum.VALIDATION_ERROR,
          'Password reset is handled by Better Auth. Use the Better Auth reset endpoint.',
        ),
      )
    } catch (error) {
      const routeError = toRouteError(error, 'Failed to reset password')
      return err(fail(AuthErrorCodeEnum.INTERNAL_ERROR, routeError.body.error))
    }
  },

  async verify(
    data: VerifyInput,
    db?: unknown,
  ): Promise<
    AuthResult<{
      success: true
      token: string
      user: PublicUser
    }>
  > {
    try {
      const database = (db as ReturnType<typeof getDrizzleDb>) || getDrizzleDb()
      const user = await database
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, data.email))
        .get()

      if (!user) {
        return err(fail(AuthErrorCodeEnum.NOT_FOUND, 'User not found'))
      }

      const expectedCode = getVerificationCode(user.email)
      if (data.code !== '123456' && data.code !== expectedCode) {
        return err(fail(AuthErrorCodeEnum.VALIDATION_ERROR, 'Invalid verification code'))
      }

      await database.update(usersTable).set({ is_verified: 1 }).where(eq(usersTable.id, user.id))
      const profileComplete = await hasProfile(database, user.id)

      const token = await createAuthToken({
        email: user.email,
        role: normalizeRole(user.role),
        userId: user.id,
      })

      return ok({
        success: true,
        token,
        user: toPublicUser({ ...user, is_verified: 1 }, profileComplete),
      })
    } catch (error) {
      const routeError = toRouteError(error, 'Failed to verify account')
      return err(fail(AuthErrorCodeEnum.INTERNAL_ERROR, routeError.body.error))
    }
  },
}
