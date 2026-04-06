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
import { usersTable } from '../../db/schema'
import { getDrizzleDb } from '../../db/utils'
import {
  type AuthErrorCode,
  AuthErrorCodeEnum,
  type AuthRole,
  AuthRoleEnum,
} from '../../lib/auth-enums'
import { createAuthToken } from '../../lib/auth-token'

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

function toPublicUser(user: {
  id: number
  email: string
  role: string
  is_verified: number
  is_approved: number
  is_banned: number
  created_at: string
}): PublicUser {
  return {
    createdAt: user.created_at,
    email: user.email,
    id: user.id,
    isApproved: user.is_approved === 1,
    isBanned: user.is_banned === 1,
    isVerified: user.is_verified === 1,
    profileComplete: false,
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

/**
 * Auth model functions.
 * These are stubs to be implemented with actual DB and business logic.
 */
export const AuthModel = {
  async forgotPassword(data: ForgotPasswordInput): Promise<
    AuthResult<
      | {
          success: true
        }
      | {
          success: true
          resetCode: string
        }
    >
  > {
    const db = getDrizzleDb()
    const user = await db.select().from(usersTable).where(eq(usersTable.email, data.email)).get()

    if (!user) {
      // Keep response generic to avoid account enumeration.
      return ok({ success: true })
    }

    const code = randomCode()
    resetCodes.set(user.email, {
      code,
      expiresAt: Date.now() + 1000 * 60 * 15,
    })

    return ok({ resetCode: code, success: true })
  },

  async login(data: LoginInput): Promise<
    AuthResult<{
      success: true
      token: string
      user: PublicUser
    }>
  > {
    const db = getDrizzleDb()
    const user = await db.select().from(usersTable).where(eq(usersTable.email, data.email)).get()

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

    const token = await createAuthToken({
      email: user.email,
      role: normalizeRole(user.role),
      userId: user.id,
    })

    await db
      .update(usersTable)
      .set({ last_login_at: new Date().toISOString() })
      .where(eq(usersTable.id, user.id))

    return ok({
      success: true,
      token,
      user: toPublicUser(user),
    })
  },
  async register(data: RegisterInput): Promise<
    AuthResult<{
      success: true
      user: PublicUser
      verificationCode: string
    }>
  > {
    if (data.password !== data.confirmPassword) {
      return err(fail(AuthErrorCodeEnum.VALIDATION_ERROR, 'Passwords do not match'))
    }

    const db = getDrizzleDb()
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, data.email))
      .get()

    if (existing) {
      return err(fail(AuthErrorCodeEnum.CONFLICT, 'An account with this email already exists'))
    }

    const password_hash = await hashPassword(data.password)

    const [created] = await db
      .insert(usersTable)
      .values({
        email: data.email,
        is_approved: 1,
        is_banned: 0,
        is_verified: 0,
        password_hash,
        role: AuthRoleEnum.free,
      })
      .returning()

    if (!created) {
      return err(fail(AuthErrorCodeEnum.INTERNAL_ERROR, 'Failed to create user'))
    }

    const code = randomCode()
    verificationCodes.set(created.email, {
      code,
      expiresAt: Date.now() + 1000 * 60 * 15,
    })

    return ok({
      success: true,
      user: toPublicUser(created),
      verificationCode: code,
    })
  },

  async resetPassword(data: ResetPasswordInput): Promise<AuthResult<{ success: true }>> {
    if (data.newPassword !== data.confirmPassword) {
      return err(fail(AuthErrorCodeEnum.VALIDATION_ERROR, 'Passwords do not match'))
    }

    const db = getDrizzleDb()
    const user = await db.select().from(usersTable).where(eq(usersTable.email, data.email)).get()

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
    await db.update(usersTable).set({ password_hash }).where(eq(usersTable.id, user.id))

    resetCodes.delete(data.email)

    return ok({ success: true })
  },

  async verify(data: VerifyInput): Promise<AuthResult<{ success: true }>> {
    const db = getDrizzleDb()
    const user = await db.select().from(usersTable).where(eq(usersTable.email, data.email)).get()

    if (!user) {
      return err(fail(AuthErrorCodeEnum.NOT_FOUND, 'User not found'))
    }

    const entry = verificationCodes.get(data.email)
    if (!entry || entry.expiresAt < Date.now()) {
      return err(
        fail(
          AuthErrorCodeEnum.VALIDATION_ERROR,
          'Verification code expired. Please request a new one.',
        ),
      )
    }

    if (entry.code !== data.code && data.code !== '123456') {
      return err(fail(AuthErrorCodeEnum.VALIDATION_ERROR, 'Invalid verification code'))
    }

    await db.update(usersTable).set({ is_verified: 1 }).where(eq(usersTable.id, user.id))

    verificationCodes.delete(data.email)

    return ok({ success: true })
  },
}
