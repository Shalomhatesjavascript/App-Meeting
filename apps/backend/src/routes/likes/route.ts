import { Elysia } from 'elysia'

const likesRoutes = new Elysia({ prefix: '/likes' })
  // Like or pass a user
  .post('/', async ({ body }) => {
    // TODO: Implement like/pass logic
    // body: { from_user_id, to_user_id, is_like }
    return { message: 'Like/pass action received', data: body }
  })
  // Get a like by ID
  .get('/:id', async ({ params }) => {
    // TODO: Fetch like by ID
    return { message: `Fetching like with id ${params.id}` }
  })
  // Get all likes for the current user (optionally filter by sent/received)
  .get('/', async ({ query }) => {
    // TODO: Fetch likes for user
    // query: { user_id, type: 'sent' | 'received' }
    return { message: 'Fetching likes', query }
  })
  // Get mutual likes (matches) for the current user
  .get('/mutual', async ({ query }) => {
    // TODO: Fetch mutual likes (matches)
    // query: { user_id }
    return { message: 'Fetching mutual likes', query }
  })

export default likesRoutes
