import { eq } from 'drizzle-orm'
import { usersTable } from '../db/schema'
import { getDrizzleDb } from '../db/utils'
import { AuthErrorCodeEnum, type AuthRole, AuthRoleEnum } from './auth-enums'
import { auth } from './better-auth'
import { createRouteError } from './route-error'

export type RequestUser = {
  id: number
  role: AuthRole
  email?: string
}

function parseTestHeaders(headers: Record<string, string | undefined>): RequestUser | null {
  if (process.env.NODE_ENV !== 'test') {
    return null
  }

  const userId = Number(headers['x-user-id'])
  if (!Number.isFinite(userId)) {
    return null
  }

  const roleHeader = headers['x-user-role']
  const roleCandidate =
    typeof roleHeader === 'string' && AuthRoleEnum.$.isValue(roleHeader)
      ? roleHeader
      : AuthRoleEnum.free

  return {
    email: headers['x-user-email'],
    id: userId,
    role: roleCandidate,
  }
}

function toHeadersObject(headers: Record<string, string | undefined>): Headers {
  const normalized = new Headers()
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      normalized.set(key, value)
    }
  }

  return normalized
}

async function parseBetterAuthSession(
  headers: Record<string, string | undefined>,
): Promise<RequestUser | null> {
  try {
    const session = await auth.api.getSession({
      headers: toHeadersObject(headers),
    })

    if (!session?.user) {
      return null
    }

    const sessionEmail = session.user.email
    if (!sessionEmail) {
      return null
    }

    const db = getDrizzleDb()
    const appUser = await db
      .select({
        email: usersTable.email,
        id: usersTable.id,
        role: usersTable.role,
      })
      .from(usersTable)
      .where(eq(usersTable.email, sessionEmail))
      .get()

    if (!appUser) {
      return null
    }

    const roleValue = appUser.role
    const roleCandidate =
      typeof roleValue === 'string' && AuthRoleEnum.$.isValue(roleValue)
        ? roleValue
        : AuthRoleEnum.free

    return {
      email: appUser.email,
      id: appUser.id,
      role: roleCandidate,
    }
  } catch {
    return null
  }
}

export async function getRequestUser(
  headers: Record<string, string | undefined>,
): Promise<RequestUser | null> {
  const fromTestHeaders = parseTestHeaders(headers)
  if (fromTestHeaders) {
    return fromTestHeaders
  }

  const fromSession = await parseBetterAuthSession(headers)
  if (fromSession) {
    return fromSession
  }

  return null
}

export async function requireUser(
  headers: Record<string, string | undefined>,
): Promise<RequestUser> {
  const user = await getRequestUser(headers)
  if (!user) {
    throw createRouteError(AuthErrorCodeEnum.AUTHENTICATION_REQUIRED, 'Authentication required')
  }
  return user
}

export async function requireAdmin(
  headers: Record<string, string | undefined>,
): Promise<RequestUser> {
  const user = await requireUser(headers)
  if (user.role !== 'admin') {
    throw createRouteError(AuthErrorCodeEnum.FORBIDDEN, 'Admin access required')
  }
  return user
}
