import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'
import { loadBackendDrizzleEnv } from './src/lib/env'

const env = loadBackendDrizzleEnv()

export default defineConfig({
  dbCredentials: {
    accountId: env.CLOUDFLARE_ACCOUNT_ID,
    databaseId: env.CLOUDFLARE_DATABASE_ID,
    token: env.CLOUDFLARE_D1_TOKEN,
  },
  dialect: 'sqlite',
  driver: 'd1-http',
  out: './drizzle',
  schema: './src/db/schema.ts',
})
