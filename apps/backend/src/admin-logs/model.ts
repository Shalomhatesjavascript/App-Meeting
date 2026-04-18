import { and, eq, gte, like, lte, type SQL } from 'drizzle-orm'
import { db } from '../utils/db'
import { type AdminLogInsertDB, AdminLogTable, type AdminLogUpdateDB } from './schema'
import type { AdminLogListQueryOutput } from './validation'

/**
 * Create a new admin log entry.
 */
export async function createAdminLog(data: AdminLogInsertDB) {
  const [created] = await db.insert(AdminLogTable).values(data).returning()

  return created
}

/**
 * Update an admin log entry by id.
 */
export async function updateAdminLog(id: number, data: AdminLogUpdateDB) {
  const [updated] = await db
    .update(AdminLogTable)
    .set(data)
    .where(eq(AdminLogTable.id, id))
    .returning()

  return updated
}

/**
 * Get an admin log entry by id.
 */
export async function getAdminLogById(id: number) {
  return db.select().from(AdminLogTable).where(eq(AdminLogTable.id, id)).get()
}

/**
 * List admin logs, optionally filtered.
 */
export async function listAdminLogs({
  action,
  adminId,
  from,
  targetUserId,
  to,
}: AdminLogListQueryOutput = {}) {
  const conditions: SQL[] = []

  if (action != null) conditions.push(like(AdminLogTable.action, `%${action}%`))
  if (adminId != null) conditions.push(eq(AdminLogTable.adminId, adminId))
  if (from != null) conditions.push(gte(AdminLogTable.createdAt, from))
  if (targetUserId != null) conditions.push(eq(AdminLogTable.targetUserId, targetUserId))
  if (to != null) conditions.push(lte(AdminLogTable.createdAt, to))

  if (conditions.length === 0) {
    return db.select().from(AdminLogTable).all()
  }

  return db
    .select()
    .from(AdminLogTable)
    .where(and(...conditions))
    .all()
}
