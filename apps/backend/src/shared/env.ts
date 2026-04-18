import * as v from 'valibot'
import { EmailSchema, UrlSchema } from './schema'

const StringSchema = v.string()

const BackendEnvSchema = v.object({
  BETTER_AUTH_SECRET: StringSchema,
  BETTER_AUTH_URL: UrlSchema,
  CLOUDFLARE_ACCOUNT_ID: StringSchema,
  CLOUDFLARE_D1_TOKEN: StringSchema,
  CLOUDFLARE_DATABASE_ID: StringSchema,
  EMAIL_SENDER: EmailSchema,
  FRONTEND_URL: UrlSchema,
  RESEND_API_KEY: StringSchema,
  NODE_ENV: v.optional(
    v.pipe(StringSchema, v.picklist(['production', 'development'])),
    'development',
  ),
})

export const BackendEnv = v.parse(BackendEnvSchema, process.env)
