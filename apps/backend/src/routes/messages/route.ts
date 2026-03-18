import { MessageCreateSchema, MessageQuerySchema, MessageReadSchema } from '@repo/shared'
import { Elysia } from 'elysia'
import * as v from 'valibot'
import { ApiRoutePrefix, getApiRoutePrefixUrl } from '../../lib/route-prefixes'

const messagesRoutes = new Elysia({ prefix: getApiRoutePrefixUrl(ApiRoutePrefix.messages) })
  // Get all messages for a match
  .get(
    '/:match_id',
    async ({ params }) => {
      // Dummy response matching MessageQuerySchema output
      return {
        messages: [
          {
            content: 'Hello!',
            match_id: Number(params.match_id),
            sender_id: 1,
          },
        ],
      }
    },
    { params: v.object({ match_id: v.string() }) },
  )
  // Send a new message in a match
  .post(
    '/',
    async ({ body }) => {
      // Dummy response matching MessageCreateSchema output
      return {
        data: {
          content: body.content ?? 'Dummy message',
          match_id: body.match_id ?? 1,
          sender_id: body.sender_id ?? 1,
        },
      }
    },
    { body: MessageCreateSchema },
  )
  // Mark a message as read
  .post(
    '/:id/read',
    async ({ params }) => {
      // Dummy response for marking as read
      return { success: true }
    },
    { params: v.object({ id: v.string() }) },
  )

export default messagesRoutes
