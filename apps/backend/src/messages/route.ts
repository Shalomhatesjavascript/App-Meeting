import { PositiveIntSchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'
import { toRouteError } from '../shared/route-error'
import { ApiRoutePrefixEnum } from '../shared/route-prefixes'
import { NumberIdParamsSchema } from '../shared/schema'
import { isUserAdminOrSelf } from '../user/model'
import { betterAuthRoute } from '../utils/auth'
import { db } from '../utils/db'
import {
  canReadMatchMessages,
  createMessage,
  getMessagesForMatch,
  markMessageAsRead,
} from './model'
import { MessageInsertSchema, MessageQuerySchema } from './validation'

const MatchIdParamsSchema = v.object({ match_id: PositiveIntSchema })

// TODO: revisit these routes later when trying to integrate it with the frontend.
const messagesRoutes = new Elysia({ prefix: ApiRoutePrefixEnum.Messages })
  .use(betterAuthRoute)
  // Get all messages for a match for a user
  .get(
    '/:match_id',
    async ({ params, query, user, status }) => {
      try {
        const allowed = await canReadMatchMessages(params.match_id, user.id)
        if (!allowed) {
          return status(403, { error: 'Access denied' })
        }

        const messages = await getMessagesForMatch({ limit: query.limit, matchId: params.match_id })

        return messages
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to fetch messages')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true, params: MatchIdParamsSchema, query: MessageQuerySchema },
  )
  // Send a new message in a match
  .post(
    '/',
    async ({ body, user, status }) => {
      try {
        if (!(await isUserAdminOrSelf(db, body.senderId, user.id))) {
          return status(403, { error: 'Access denied' })
        }

        const message = await createMessage(body)
        return message
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to send message')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true, body: MessageInsertSchema },
  )
  // Mark a message as read
  .post(
    '/:id/read',
    async ({ params, user, status }) => {
      try {
        const updated = await markMessageAsRead(params.id, user.id)

        if (!updated) {
          return status(404, { error: 'Message not found' })
        }

        return updated
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to update message')
        return status(routeError.status, routeError.body)
      }
    },
    {
      auth: true,
      params: NumberIdParamsSchema,
    },
  )

export default messagesRoutes
