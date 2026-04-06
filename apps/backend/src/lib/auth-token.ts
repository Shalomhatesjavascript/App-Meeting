import { signJWT, verifyJWT } from 'better-auth/crypto'
import * as v from 'valibot'
import { type AuthRole, AuthRoleSchema } from './auth-enums'
import { getRuntimeString } from './runtime-env'

export type AuthTokenPayload = {
  userId: number
  role: AuthRole
  email: string
}

export const AuthTokenPayloadSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  role: AuthRoleSchema,
  userId: v.number(),
})

export function getAuthSecret(): string {
  return (
    getRuntimeString('BETTER_AUTH_SECRET') ||
    getRuntimeString('AUTH_SECRET') ||
    getRuntimeString('JWT_SECRET') ||
    'dev-secret-change-me'
  )
}

export async function createAuthToken(payload: AuthTokenPayload): Promise<string> {
  return signJWT(payload, getAuthSecret(), 60 * 60 * 24 * 7)
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  const payload = await verifyJWT(token, getAuthSecret())
  const parsed = v.safeParse(AuthTokenPayloadSchema, payload)

  if (!parsed.success) {
    return null
  }

  return parsed.output
}
