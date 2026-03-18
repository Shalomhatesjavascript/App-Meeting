import { AdminLogCreateSchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'

const adminLogsRoutes = new Elysia({ prefix: '/admin-logs', })
  // List all admin logs, with optional filters (e.g., by admin, action, date)
  .get('/', async () => {
    // Dummy response matching AdminLogCreateSchema output array
    return {
      data: [
        {
          admin_id: 1,
          action: 'dummy_action',
          target_user_id: 2,
          timestamp: new Date().toISOString(),
        },
      ],
    }
  })
  // Get a specific admin log by ID
  .get(
    '/:id',
    async ({ params }) => {
      // Dummy response matching AdminLogCreateSchema output
      return {
        data: {
          admin_id: 1,
          action: 'dummy_action',
          target_user_id: 2,
          timestamp: new Date().toISOString(),
        },
      }
    },
    {
      params: v.pick(AdminLogCreateSchema, ["admin_id"])
    }
  )
  // Create a new admin log entry (should be called internally by admin actions)
  .post(
    '/',
    async ({ body }) => {
      // Dummy response matching AdminLogCreateSchema output
      return {
        data: {
          admin_id: body.admin_id ?? 1,
          action: body.action ?? 'dummy_action',
          target_user_id: body.target_user_id ?? 2,
          timestamp: body.timestamp ?? new Date().toISOString(),
        },
      }
    }, {body:AdminLogCreateSchema}
  )

export default adminLogsRoutes
