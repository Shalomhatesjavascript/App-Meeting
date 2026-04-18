import { Elysia } from 'elysia'
import { toRouteError } from '../shared/route-error'
import { ApiRoutePrefixEnum } from '../shared/route-prefixes'
import { NumberIdParamsSchema } from '../shared/schema'
import { isUserAdmin } from '../user/model'
import { betterAuthRoute } from '../utils/auth'
import { db } from '../utils/db'
import {
  createInterest,
  deleteInterest,
  getAllInterests,
  getInterestById,
  updateInterest,
} from './model'
import { InterestInsertSchema, InterestUpdateSchema } from './validation'

const interestsRoutes = new Elysia({ prefix: ApiRoutePrefixEnum.Interests })
  .use(betterAuthRoute)
  // Get all interests
  .get(
    '/',
    async ({ status }) => {
      try {
        const interests = await getAllInterests(db)

        return interests
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to list interests')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true },
  )
  // Get a specific interest by id
  .get(
    '/:id',
    async ({ params, status }) => {
      try {
        const interest = await getInterestById(db, params.id)
        if (!interest) {
          return status(404, { error: 'Interest not found' })
        }

        return interest
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to fetch interest')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true, params: NumberIdParamsSchema },
  )
  // Create a new interest
  .post(
    '/',
    async ({ body, user, status }) => {
      try {
        if (!(await isUserAdmin(db, user.id))) {
          return status(403, { error: 'Admin access required' })
        }
        const created = await createInterest(db, body)

        return created
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to create interest')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true, body: InterestInsertSchema },
  )
  // Update an interest
  .put(
    '/:id',
    async ({ params, body, user, status }) => {
      try {
        if (!(await isUserAdmin(db, user.id))) {
          return status(403, { error: 'Admin access required' })
        }

        const updated = await updateInterest(db, params.id, body)

        if (!updated) {
          return status(404, { error: 'Interest not found' })
        }

        return updated
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to update interest')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true, body: InterestUpdateSchema, params: NumberIdParamsSchema },
  )
  // Delete an interest
  .delete(
    '/:id',
    async ({ params, user, status }) => {
      try {
        if (!(await isUserAdmin(db, user.id))) {
          return status(403, { error: 'Admin access required' })
        }

        await deleteInterest(db, params.id)

        return { success: true }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to delete interest')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true, params: NumberIdParamsSchema },
  )

export default interestsRoutes
