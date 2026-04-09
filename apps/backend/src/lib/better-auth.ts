import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { eq } from 'drizzle-orm'
import { usersTable } from '../db/schema'
import { getDrizzleDb } from '../db/utils'
import { AuthRoleEnum } from './auth-enums'
import { getRuntimeString } from './runtime-env'

function getAuthBaseURL(): string {
  return getRuntimeString('BETTER_AUTH_URL') || 'http://localhost:8787'
}

export const auth = betterAuth({
  basePath: '/api/better-auth',
  baseURL: getAuthBaseURL(),
  database: drizzleAdapter(getDrizzleDb(), {
    provider: 'sqlite',
  }),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const db = getDrizzleDb()
          const existing = await db
            .select({ id: usersTable.id })
            .from(usersTable)
            .where(eq(usersTable.email, user.email))
            .get()

          if (!existing) {
            await db
              .insert(usersTable)
              .values({
                email: user.email,
                is_approved: 1,
                is_banned: 0,
                is_verified: user.emailVerified ? 1 : 0,
                password_hash: 'better-auth-managed',
                role: AuthRoleEnum.free,
              })
              .run()
            return
          }

          await db
            .update(usersTable)
            .set({ is_verified: user.emailVerified ? 1 : 0 })
            .where(eq(usersTable.id, existing.id))
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  secret: getRuntimeString('BETTER_AUTH_SECRET') || getRuntimeString('AUTH_SECRET'),
  trustedOrigins: [
    getRuntimeString('FRONTEND_URL') || 'http://localhost:5173',
    getRuntimeString('BETTER_AUTH_URL') || 'http://localhost:8787',
  ],
})
