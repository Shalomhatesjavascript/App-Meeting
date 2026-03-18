import { type DrizzleD1Database, drizzle } from 'drizzle-orm/d1'
import { env } from 'elysia'

export type DB = DrizzleD1Database<Record<string, never>> & {
  $client: string | undefined
}

let db: DB | undefined

export function getDrizzleDb(): DB {
  if (db) return db

  db = drizzle(env.DB)

  return db
}
