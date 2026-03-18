import { Elysia } from 'elysia'

const userInterestsRoutes = new Elysia({ prefix: '/user-interests' })
  // Get all interests for a user
  .get('/:userId', async ({ params }) => {
    // TODO: Implement fetching user interests
    return { message: `Get interests for user ${params.userId}` }
  })
  // Add an interest to a user
  .post('/', async ({ body }) => {
    // TODO: Implement adding an interest to a user
    return { message: 'Add interest to user', data: body }
  })
  // Remove an interest from a user
  .delete('/', async ({ body }) => {
    // TODO: Implement removing an interest from a user
    return { message: 'Remove interest from user', data: body }
  })

export default userInterestsRoutes
