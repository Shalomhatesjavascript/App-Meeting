import { MessageCreateSchema, MessageQuerySchema, MessageReadSchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'
import { requireUser } from '../../lib/request-auth'
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
        const match_id = Number(params.match_id)
        if (!Number.isFinite(match_id)) {
          return status(400, { error: 'Invalid match id' })
        }

        const allowed = await canReadMatchMessages(match_id, requester.id)
        if (!allowed && requester.role !== 'admin') {
          return status(403, { error: 'Access denied' })
        }

        const parsed = v.safeParse(MessageQuerySchema, {
          before_id: query.before_id ? Number(query.before_id) : undefined,
          limit: query.limit ? Number(query.limit) : undefined,
          match_id,
        })

        if (!parsed.success) {
          return status(400, { error: 'Invalid query parameters' })
        }

        const messages = await getMessagesForMatch(parsed.output)
        return { data: messages }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch messages'
        return status(400, { error: message })
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
        if (requester.role !== 'admin' && requester.id !== body.sender_id) {
          return status(403, { error: 'Access denied' })
        }

        const message = await createMessage(body)
        return { data: message }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to send message'
        return status(400, { error: message })
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
        const parsed = v.safeParse(MessageReadSchema, { id: Number(params.id) })
        if (!parsed.success) {
          return status(400, { error: 'Invalid message id' })
        }
        const updated = await markMessageAsRead(parsed.output)
        return { data: updated }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update message'
        return status(400, { error: message })
      }
    },
    { params: v.object({ id: v.string() }) },
  )

export default messagesRoutes
