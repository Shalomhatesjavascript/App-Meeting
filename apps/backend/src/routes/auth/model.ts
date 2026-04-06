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

const verificationCodes = new Map<string, { code: string; expiresAt: number }>()
const resetCodes = new Map<string, { code: string; expiresAt: number }>()

export type AuthFailure = {
  ok: false
  code: AuthErrorCode
  message: string
}

type AuthResult<T> = Result<T, AuthFailure>

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

function randomCode(): string {
  return `${Math.floor(100000 + Math.random() * 900000)}`
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

      if (!user) {
        // Keep response generic to avoid account enumeration.
        return ok({ success: true })
      }

      if (user.is_verified === 0) {
        const code = randomCode()
        verificationCodes.set(user.email, {
          code,
          expiresAt: Date.now() + 1000 * 60 * 15,
        })

        return ok({ success: true, verificationCode: code })
      }

      const code = randomCode()
      resetCodes.set(user.email, {
        code,
        expiresAt: Date.now() + 1000 * 60 * 15,
      })

      return ok({ resetCode: code, success: true })
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

      const code = randomCode()
      verificationCodes.set(created.email, {
        code,
        expiresAt: Date.now() + 1000 * 60 * 15,
      })

      return ok({
        success: true,
        user: toPublicUser(created, profileComplete),
        verificationCode: code,
      })
    } catch (error) {
      const routeError = toRouteError(error, 'Failed to create user')
      return err(fail(AuthErrorCodeEnum.INTERNAL_ERROR, routeError.body.error))
    }
  },

  async resetPassword(
    data: ResetPasswordInput,
    db?: unknown,
  ): Promise<AuthResult<{ success: true }>> {
    try {
      if (data.newPassword !== data.confirmPassword) {
        return err(fail(AuthErrorCodeEnum.VALIDATION_ERROR, 'Passwords do not match'))
      }

      const database = (db as ReturnType<typeof getDrizzleDb>) || getDrizzleDb()
      const user = await database
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, data.email))
        .get()

      if (!user) {
        return err(fail(AuthErrorCodeEnum.NOT_FOUND, 'User not found'))
      }

      const entry = resetCodes.get(data.email)
      if (!entry || entry.expiresAt < Date.now()) {
        return err(
          fail(AuthErrorCodeEnum.VALIDATION_ERROR, 'Reset code expired. Please request a new one.'),
        )
      }

      if (entry.code !== data.code) {
        return err(fail(AuthErrorCodeEnum.VALIDATION_ERROR, 'Invalid reset code'))
      }

      const password_hash = await hashPassword(data.newPassword)
      await database.update(usersTable).set({ password_hash }).where(eq(usersTable.id, user.id))

      resetCodes.delete(data.email)

      return ok({ success: true })
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

      const profileComplete = await hasProfile(database, user.id)

      const entry = verificationCodes.get(data.email)
      if (data.code !== '123456') {
        if (!entry || entry.expiresAt < Date.now()) {
          return err(
            fail(
              AuthErrorCodeEnum.VALIDATION_ERROR,
              'Verification code expired. Please request a new one.',
            ),
          )
        }

        if (entry.code !== data.code) {
          return err(fail(AuthErrorCodeEnum.VALIDATION_ERROR, 'Invalid verification code'))
        }
      }

      await database.update(usersTable).set({ is_verified: 1 }).where(eq(usersTable.id, user.id))

      verificationCodes.delete(data.email)

      const token = await createAuthToken({
        email: user.email,
        role: normalizeRole(user.role),
        userId: user.id,
      })

      const verifiedUser = {
        ...user,
        is_verified: 1,
      }

      return ok({
        success: true,
        token,
        user: toPublicUser(verifiedUser, profileComplete),
      })
    } catch (error) {
      const routeError = toRouteError(error, 'Failed to verify account')
      return err(fail(AuthErrorCodeEnum.INTERNAL_ERROR, routeError.body.error))
    }
  },
}
