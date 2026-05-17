import { Elysia } from 'elysia'
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
      if (!(await isUserAdmin(db, user.id))) {
        return status(403, { error: 'Admin access required' })
      }

      const logs = await listAdminLogs(query)

      return logs
    },
    { auth: true, query: AdminLogListQuerySchema },
  )
  // Get a specific admin log by ID
  .get(
    '/:id',
    async ({ params: { id }, user, status }) => {
      if (!(await isUserAdmin(db, user.id))) {
        return status(403, { error: 'Admin access required' })
      }

      const log = await getAdminLogById(id)

      if (!log) {
        return status(404, { error: 'Log not found' })
      }

      return log
    },
    { auth: true, params: NumberIdParamsSchema },
  )
  // Create a new admin log entry (should be called internally by admin actions)
  .post(
    '/',
    async ({ body, user, status }) => {
      if (!(await isUserAdmin(db, user.id))) {
        return status(403, { error: 'Admin access required' })
      }
      const created = await createAdminLog(body)
      return created
    },
    { auth: true, body: AdminLogCreateSchema },
  )

export default adminLogsRoutes
