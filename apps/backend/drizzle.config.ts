import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  casing: 'camelCase',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID,
    token: process.env.CLOUDFLARE_D1_TOKEN,
  },
  dialect: 'sqlite',
  driver: 'd1-http',
  out: './drizzle',
  schema: './src/**/schema.ts',
})
