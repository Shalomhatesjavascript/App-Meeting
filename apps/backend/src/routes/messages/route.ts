import { Elysia } from 'elysia'

const messagesRoutes = new Elysia({ prefix: '/messages' })
  // Get all messages for a match
  .get('/:match_id', async ({ params }) => {
    // TODO: Fetch messages for the given match_id
    return { messages: [] }
  })
  // Send a new message in a match
  .post('/', async ({ body }) => {
    // TODO: Create a new message (expects match_id, sender_id, content)
    return { success: true }
  })
  // Mark a message as read
  .post('/:id/read', async ({ params }) => {
    // TODO: Mark message with :id as read
    return { success: true }
  })

export default messagesRoutes
