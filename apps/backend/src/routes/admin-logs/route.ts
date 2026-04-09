import { AdminLogCreateSchema, AdminLogListQuerySchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'
import { parsePositiveInt } from '../../lib/input-parsers'
import { requireAdmin } from '../../lib/request-auth'
import { toRouteError } from '../../lib/route-error'
import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'
import { createAdminLog, getAdminLogById, listAdminLogs } from './model'

const adminLogsRoutes = new Elysia({ prefix: getApiRoutePrefixUrl(ApiRoutePrefix['admin-logs']) })
  // List all admin logs, with optional filters (e.g., by admin, action, date)
  .get('/', async ({ headers, query, status }) => {
    try {
      await requireAdmin(headers)

      const parsedAdminId = query.admin_id ? parsePositiveInt(query.admin_id) : null
      const parsedTargetUserId = query.target_user_id
        ? parsePositiveInt(query.target_user_id)
        : null
      if (parsedAdminId && !parsedAdminId.success) {
        return status(400, { error: 'Invalid query parameters' })
      }
      if (parsedTargetUserId && !parsedTargetUserId.success) {
        return status(400, { error: 'Invalid query parameters' })
      }

      const parsed = v.safeParse(AdminLogListQuerySchema, {
        action: query.action,
        admin_id: parsedAdminId?.success ? parsedAdminId.value : undefined,
        from: query.from,
        target_user_id: parsedTargetUserId?.success ? parsedTargetUserId.value : undefined,
        to: query.to,
      })
      if (!parsed.success) {
        return status(400, { error: 'Invalid query parameters' })
      }

      const logs = await listAdminLogs({
        action: parsed.output.action,
        admin_id: parsed.output.admin_id,
        from: parsed.output.from,
        target_user_id: parsed.output.target_user_id,
        to: parsed.output.to,
      })
      return {
        data: logs,
      }
    } catch (error) {
      const routeError = toRouteError(error, 'Failed to list logs')
      return status(routeError.status, routeError.body)
    }
  })
  // Get a specific admin log by ID
  .get(
    '/:id',
    async ({ params, headers, status }) => {
      try {
        await requireAdmin(headers)
        const parsed = parsePositiveInt(params.id)
        if (!parsed.success) {
          return status(400, { error: 'Invalid log id' })
        }
        const log = await getAdminLogById(parsed.value)
        if (!log) {
          return status(404, { error: 'Log not found' })
        }
        return {
          data: log,
        }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to fetch log')
        return status(routeError.status, routeError.body)
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
        const routeError = toRouteError(error, 'Failed to create log')
        return status(routeError.status, routeError.body)
      }
    },
    { body: AdminLogCreateSchema },
  )

export default adminLogsRoutes
