import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP } from 'better-auth/plugins'
import Elysia from 'elysia'
import * as v from 'valibot'
import { EmailService } from '../shared/email'
import { BackendEnv } from '../shared/env'
import { ApiRoutePrefixEnum } from '../shared/route-prefixes'
import { EmailSchema } from '../shared/schema'
import { UserMetaTable } from '../user/schema'
import * as authSchema from './auth/schema'
import { db } from './db'

export const auth = betterAuth({
  // Auth will be mounted at the app level under the '/api/better-auth' prefix.
  // Set basePath to '/' so the mount's prefix is not stripped twice.
  basePath: '/',
  database: drizzleAdapter(db, {
    camelCase: true,
    provider: 'sqlite',
    schema: authSchema,
    usePlural: true,
  }),
  databaseHooks: {
    user: {
      create: {
        async after(user) {
          await db.insert(UserMetaTable).values({ userId: user.id })
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
  },
  plugins: [
    emailOTP({
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        const isEmailVerification = type === 'email-verification'

        await EmailService.sendEmail({
          html: `
  <div style="background:#111827;border:1px solid #1f2937;border-radius:16px;padding:28px;">
    
    <h2 style="margin:0 0 10px;color:#ffffff;font-size:20px;">
        ${isEmailVerification ? 'Verify your email' : 'Sign-in code'}
    </h2>
    
    <p style="margin:0 0 20px;color:#9ca3af;font-size:14px;line-height:1.5;">
      ${
        isEmailVerification
          ? 'Use the code below to verify your email. It expires in a few minutes.'
          : 'Use the code below to continue signing in. It expires in a few minutes.'
      }
    </p>

    <div style="
      background:#0b1220;
      border:1px solid #243042;
      border-radius:12px;
      padding:16px;
      text-align:center;
      letter-spacing:6px;
      font-size:28px;
      font-weight:700;
      color:#ffffff;
    ">
      ${otp}
    </div>

    <p style="margin:18px 0 0;color:#6b7280;font-size:12px;">
      If you didn’t request this, you can ignore this email.
    </p>

    <div style="margin-top:24px;padding-top:16px;border-top:1px solid #1f2937;">
      <p style="margin:0;color:#4b5563;font-size:12px;">
        Code type: ${type}
      </p>
    </div>

  </div>
  
  <p style="text-align:center;margin-top:16px;color:#374151;font-size:11px;">
    YourApp Security
  </p>

</div>`,
          subject: isEmailVerification
            ? 'Verify your BU Connect email'
            : 'Your BU Connect sign-in code',
          to: v.parse(EmailSchema, email),
        })
      },
    }),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds (5 minutes)
    },
  },
  trustedOrigins: [BackendEnv.FRONTEND_URL],
} as const)

export const betterAuthRoute = new Elysia({ name: 'better-auth' })
  .mount(ApiRoutePrefixEnum.BetterAuth, auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        })

        if (!session) {
          return status(401, { error: 'Authentication required' })
        }

        return session
      },
    },
  })
