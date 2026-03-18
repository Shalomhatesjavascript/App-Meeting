import { Elysia } from 'elysia'

const interestsRoutes = new Elysia({ prefix: '/interests' })
  // Get all interests
  .get('/', async () => {
    // TODO: Implement fetching all interests
    return { message: 'List all interests' }
  })
  // Get a specific interest by id
  .get('/:id', async ({ params }) => {
    // TODO: Implement fetching a single interest by id
    return { message: `Get interest with id ${params.id}` }
  })
  // Create a new interest
  .post('/', async ({ body }) => {
    // TODO: Implement creating a new interest
    return { message: 'Create new interest', data: body }
  })
  // Update an interest
  .put('/:id', async ({ params, body }) => {
    // TODO: Implement updating an interest
    return { message: `Update interest with id ${params.id}`, data: body }
  })
  // Delete an interest
  .delete('/:id', async ({ params }) => {
    // TODO: Implement deleting an interest
    return { message: `Delete interest with id ${params.id}` }
  })

export default interestsRoutes
