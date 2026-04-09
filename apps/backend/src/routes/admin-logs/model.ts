import type { AdminLogCreateInput, AdminLogUpdateInput } from '@repo/shared'
import { and, eq, gte, like, lte } from 'drizzle-orm'
import { adminLogsTable } from '../../db/schema'
import { getDrizzleDb } from '../../db/utils'

/**
 * Create a new admin log entry.
 */
export async function createAdminLog(data: AdminLogCreateInput) {
  const db = getDrizzleDb()
  const [created] = await db
    .insert(adminLogsTable)
    .values({
      action: data.action,
      admin_id: data.admin_id,
      target_user_id: data.target_user_id,
      timestamp: data.timestamp ?? new Date().toISOString(),
    })
    .returning()

  return created
}

/**
 * Update an admin log entry by id.
 */
export async function updateAdminLog(id: number, data: AdminLogUpdateInput) {
  const db = getDrizzleDb()
  const [updated] = await db
    .update(adminLogsTable)
    .set({
      action: data.action,
      admin_id: data.admin_id,
      target_user_id: data.target_user_id,
      timestamp: data.timestamp,
    })
    .where(eq(adminLogsTable.id, id))
    .returning()

  return updated
}

/**
 * Get an admin log entry by id.
 */
export async function getAdminLogById(id: number) {
  const db = getDrizzleDb()
  return db.select().from(adminLogsTable).where(eq(adminLogsTable.id, id)).get()
}

/**
 * List admin logs, optionally filtered.
 */
export async function listAdminLogs(filter?: {
  admin_id?: number
  target_user_id?: number
  action?: string
  from?: string
  to?: string
}) {
  const db = getDrizzleDb()

  const conditions = [
    filter?.admin_id !== undefined ? eq(adminLogsTable.admin_id, filter.admin_id) : undefined,
    filter?.target_user_id !== undefined
      ? eq(adminLogsTable.target_user_id, filter.target_user_id)
      : undefined,
    filter?.action !== undefined ? like(adminLogsTable.action, `%${filter.action}%`) : undefined,
    filter?.from !== undefined ? gte(adminLogsTable.timestamp, filter.from) : undefined,
    filter?.to !== undefined ? lte(adminLogsTable.timestamp, filter.to) : undefined,
  ].filter(Boolean)

  if (conditions.length === 0) {
    return db.select().from(adminLogsTable).all()
  }

  return db
    .select()
    .from(adminLogsTable)
    .where(and(...conditions))
    .all()
}
