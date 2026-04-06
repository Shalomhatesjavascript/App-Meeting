import { eq } from 'drizzle-orm'
import * as v from 'valibot'

import { usersTable } from '../db/schema'
import { getDrizzleDb } from '../db/utils'

import { type AuthRole, AuthRoleEnum, AuthRoleSchema } from './auth-enums'
import { verifyAuthToken } from './auth-token'

export type RequestUser = {
  id: number
  role: AuthRole
  email?: string
}

async function parseToken(authorization?: string): Promise<RequestUser | null> {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null
  }

  try {
    const parsed = await verifyAuthToken(authorization.slice('Bearer '.length))
    if (!parsed || typeof parsed.userId !== 'number' || !parsed.role) {
      return null
    }

    return {
      email: parsed.email,
      id: parsed.userId,
      role: parsed.role,
    }
  } catch {
    return null
  }
}

export async function getRequestUser(
  headers: Record<string, string | undefined>,
): Promise<RequestUser | null> {
  const fromToken = await parseToken(headers.authorization)
  if (fromToken) {
    return fromToken
  }

  const idValue = headers['x-user-id']
  if (!idValue) {
    const emailValue = headers['x-user-email']
    if (!emailValue) {
      return null
    }

    const db = getDrizzleDb()
    const user = await db.select().from(usersTable).where(eq(usersTable.email, emailValue)).get()
    if (!user) {
      return null
    }

    return {
      email: user.email,
      id: user.id,
      role: user.role === 'admin' || user.role === 'premium' ? user.role : AuthRoleEnum.free,
    }
  }

  const id = Number(idValue)
  if (!Number.isFinite(id)) {
    const emailValue = headers['x-user-email']
    if (!emailValue) {
      return null
    }

    const db = getDrizzleDb()
    const user = await db.select().from(usersTable).where(eq(usersTable.email, emailValue)).get()
    if (!user) {
      return null
    }

    return {
      email: user.email,
      id: user.id,
      role: user.role === 'admin' || user.role === 'premium' ? user.role : AuthRoleEnum.free,
    }
  }

  const roleHeader = headers['x-user-role']
  const parsedRole = v.safeParse(AuthRoleSchema, roleHeader)
  const role = parsedRole.success ? parsedRole.output : AuthRoleEnum.free

  return { email: headers['x-user-email'], id, role }
}

export async function requireUser(
  headers: Record<string, string | undefined>,
): Promise<RequestUser> {
  const user = await getRequestUser(headers)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireAdmin(
  headers: Record<string, string | undefined>,
): Promise<RequestUser> {
  const user = await requireUser(headers)
  if (user.role !== 'admin') {
    throw new Error('Admin access required')
  }
  return user
}
