import { Elysia } from 'elysia'
import * as v from 'valibot'
import {
  MessageCreateSchema,
  MessageReadSchema,
  MessageQuerySchema,
} from '@repo/shared'

const messagesRoutes = new Elysia({ prefix: '/messages' })
  // Get all messages for a match
  .get(
    '/:match_id',
    async ({ params }) => {
      // Dummy response matching MessageQuerySchema output
      return {
        messages: [
          {
            match_id: Number(params.match_id),
            sender_id: 1,
            content: 'Hello!',
          },
        ],
      }
    },
    { params: v.object({ match_id: v.string() }) }
  )
  // Send a new message in a match
  .post(
    '/',
    async ({ body }) => {
      // Dummy response matching MessageCreateSchema output
      return {
        data: {
          match_id: body.match_id ?? 1,
          sender_id: body.sender_id ?? 1,
          content: body.content ?? 'Dummy message',
        },
      }
    },
    { body: MessageCreateSchema }
  )
  // Mark a message as read
  .post(
    '/:id/read',
    async ({ params }) => {
      // Dummy response for marking as read
      return { success: true }
    },
    { params: v.object({ id: v.string() }) }
  )

export default messagesRoutes
