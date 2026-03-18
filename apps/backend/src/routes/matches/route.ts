import { Elysia } from 'elysia'

/**
 * Matches route module.
 * Handles listing matches for a user and fetching match details.
 * Extend with controllers/services as needed.
 */
const matchesRoutes = new Elysia({ prefix: '/matches' })
  // Get all matches for the authenticated user
  .get('/', async () => {
    // TODO: Implement fetching matches for the current user
    return { message: 'List of matches for user (not implemented)' }
  })
  // Get details for a specific match
  .get('/:id', async ({ params /*, db, ... */ }) => {
    // TODO: Implement fetching match details by ID
    return { message: `Details for match ${params.id} (not implemented)` }
  })

export default matchesRoutes
