import { AdminLogCreateSchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'
import { requireAdmin } from '../../lib/request-auth'
import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'
import { createAdminLog, getAdminLogById, listAdminLogs } from './model'

const adminLogsRoutes = new Elysia({ prefix: getApiRoutePrefixUrl(ApiRoutePrefix['admin-logs']) })
  // List all admin logs, with optional filters (e.g., by admin, action, date)
  .get('/', async ({ headers, query, status }) => {
    try {
      await requireAdmin(headers)
      const logs = await listAdminLogs({
        action: query.action,
        admin_id: query.admin_id ? Number(query.admin_id) : undefined,
        from: query.from,
        target_user_id: query.target_user_id ? Number(query.target_user_id) : undefined,
        to: query.to,
      })
      return {
        data: logs,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list logs'
      return status(message.includes('Admin') ? 403 : 400, { error: message })
    }
  })
  // Get a specific admin log by ID
  .get(
    '/:id',
    async ({ params, headers, status }) => {
      try {
        await requireAdmin(headers)
        const id = Number(params.id)
        if (!Number.isFinite(id)) {
          return status(400, { error: 'Invalid log id' })
        }
        const log = await getAdminLogById(id)
        if (!log) {
          return status(404, { error: 'Log not found' })
        }
        return {
          data: log,
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch log'
        return status(message.includes('Admin') ? 403 : 400, { error: message })
      }
    },
    {
      params: v.object({ id: v.string() }),
    },
  )
  // Create a new admin log entry (should be called internally by admin actions)
  .post(
    '/',
    async ({ body, headers, status }) => {
      try {
        await requireAdmin(headers)
        const created = await createAdminLog(body)
        return {
          data: created,
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create log'
        return status(message.includes('Admin') ? 403 : 400, { error: message })
      }
    },
    { body: AdminLogCreateSchema },
  )

export default adminLogsRoutes
