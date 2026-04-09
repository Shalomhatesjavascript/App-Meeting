import { MessageCreateSchema, MessageQuerySchema, MessageReadSchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'
import { isSelfOrAdmin } from '../../lib/access-control'
import { parsePositiveInt } from '../../lib/input-parsers'
import { requireUser } from '../../lib/request-auth'
import { toRouteError } from '../../lib/route-error'
import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'
import {
  canReadMatchMessages,
  createMessage,
  getMessagesForMatch,
  markMessageAsRead,
} from './model'

const messagesRoutes = new Elysia({ prefix: getApiRoutePrefixUrl(ApiRoutePrefix.messages) })
  // Get all messages for a match
  .get(
    '/:match_id',
    async ({ params, query, headers, status }) => {
      try {
        const requester = await requireUser(headers)
        const parsedMatchId = parsePositiveInt(params.match_id)
        if (!parsedMatchId.success) {
          return status(400, { error: 'Invalid match id' })
        }

        const allowed = await canReadMatchMessages(parsedMatchId.value, requester.id)
        if (!allowed && requester.role !== 'admin') {
          return status(403, { error: 'Access denied' })
        }

        const parsedBeforeId = query.before_id ? parsePositiveInt(query.before_id) : null
        const parsedLimit = query.limit ? parsePositiveInt(query.limit) : null
        if (parsedBeforeId && !parsedBeforeId.success) {
          return status(400, { error: 'Invalid query parameters' })
        }
        if (parsedLimit && !parsedLimit.success) {
          return status(400, { error: 'Invalid query parameters' })
        }

        const parsed = v.safeParse(MessageQuerySchema, {
          before_id: parsedBeforeId?.success ? parsedBeforeId.value : undefined,
          limit: parsedLimit?.success ? parsedLimit.value : undefined,
          match_id: parsedMatchId.value,
        })

        if (!parsed.success) {
          return status(400, { error: 'Invalid query parameters' })
        }

        const messages = await getMessagesForMatch(parsed.output)
        return { data: messages }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to fetch messages')
        return status(routeError.status, routeError.body)
      }
    },
    { params: v.object({ match_id: v.string() }) },
  )
  // Send a new message in a match
  .post(
    '/',
    async ({ body, headers, status }) => {
      try {
        const requester = await requireUser(headers)
        if (!isSelfOrAdmin(requester, body.sender_id)) {
          return status(403, { error: 'Access denied' })
        }

        const message = await createMessage(body)
        return { data: message }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to send message')
        return status(routeError.status, routeError.body)
      }
    },
    { body: MessageCreateSchema },
  )
  // Mark a message as read
  .post(
    '/:id/read',
    async ({ params, headers, status }) => {
      try {
        await requireUser(headers)
        const parsedId = parsePositiveInt(params.id)
        if (!parsedId.success) {
          return status(400, { error: 'Invalid message id' })
        }

        const parsed = v.safeParse(MessageReadSchema, { id: parsedId.value })
        if (!parsed.success) {
          return status(400, { error: 'Invalid message id' })
        }
        const updated = await markMessageAsRead(parsed.output)
        return { data: updated }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to update message')
        return status(routeError.status, routeError.body)
      }
    },
    { params: v.object({ id: v.string() }) },
  )

export default messagesRoutes
