import { type DrizzleD1Database, drizzle } from 'drizzle-orm/d1'
import { getRuntimeBinding } from '../lib/runtime-env'

export type DB = DrizzleD1Database<Record<string, never>> & {
  $client: string | undefined
}

let db: DB | undefined

export function getDrizzleDb(): DB {
  if (db) return db

  const database = getRuntimeBinding<Parameters<typeof drizzle>[0]>('DB')
  if (!database) {
    throw new Error('D1 database binding DB is not available')
  }

  db = drizzle(database)

  return db
}
