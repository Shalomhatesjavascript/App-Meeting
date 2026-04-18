import { Elysia } from 'elysia'
import { toRouteError } from '../shared/route-error'
import { ApiRoutePrefixEnum } from '../shared/route-prefixes'
import { NumberIdParamsSchema } from '../shared/schema'
import { isUserAdmin } from '../user/model'
import { betterAuthRoute } from '../utils/auth'
import { db } from '../utils/db'
import { createAdminLog, getAdminLogById, listAdminLogs } from './model'
import { AdminLogCreateSchema, AdminLogListQuerySchema } from './validation'

const adminLogsRoutes = new Elysia({ prefix: ApiRoutePrefixEnum.AdminLogs })
  .use(betterAuthRoute)
  // List all admin logs, with optional filters (e.g., by admin, action, date)
  .get(
    '/',
    async ({ user, query, status }) => {
      try {
        if (!(await isUserAdmin(db, user.id))) {
          return status(403, { error: 'Admin access required' })
        }

        const logs = await listAdminLogs(query)

        return logs
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to list logs')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true, query: AdminLogListQuerySchema },
  )
  // Get a specific admin log by ID
  .get(
    '/:id',
    async ({ params: { id }, user, status }) => {
      try {
        if (!(await isUserAdmin(db, user.id))) {
          return status(403, { error: 'Admin access required' })
        }

        const log = await getAdminLogById(id)

        if (!log) {
          return status(404, { error: 'Log not found' })
        }

        return log
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to fetch log')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true, params: NumberIdParamsSchema },
  )
  // Create a new admin log entry (should be called internally by admin actions)
  .post(
    '/',
    async ({ body, user, status }) => {
      try {
        if (!(await isUserAdmin(db, user.id))) {
          return status(403, { error: 'Admin access required' })
        }
        const created = await createAdminLog(body)
        return created
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to create log')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true, body: AdminLogCreateSchema },
  )

export default adminLogsRoutes
