import { Elysia } from 'elysia'
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
    async () => {
      const interests = await getAllInterests(db)

      return interests
    },
    { auth: true },
  )
  // Get a specific interest by id
  .get(
    '/:id',
    async ({ params, status }) => {
      const interest = await getInterestById(db, params.id)
      if (!interest) {
        return status(404, { error: 'Interest not found' })
      }

      return interest
    },
    { auth: true, params: NumberIdParamsSchema },
  )
  // Create a new interest
  .post(
    '/',
    async ({ body, user, status }) => {
      if (!(await isUserAdmin(db, user.id))) {
        return status(403, { error: 'Admin access required' })
      }
      const created = await createInterest(db, body)

      return created
    },
    { auth: true, body: InterestInsertSchema },
  )
  // Update an interest
  .put(
    '/:id',
    async ({ params, body, user, status }) => {
      if (!(await isUserAdmin(db, user.id))) {
        return status(403, { error: 'Admin access required' })
      }

      const updated = await updateInterest(db, params.id, body)

      if (!updated) {
        return status(404, { error: 'Interest not found' })
      }

      return updated
    },
    { auth: true, body: InterestUpdateSchema, params: NumberIdParamsSchema },
  )
  // Delete an interest
  .delete(
    '/:id',
    async ({ params, user, status }) => {
      if (!(await isUserAdmin(db, user.id))) {
        return status(403, { error: 'Admin access required' })
      }

      await deleteInterest(db, params.id)

      return { success: true }
    },
    { auth: true, params: NumberIdParamsSchema },
  )

export default interestsRoutes
