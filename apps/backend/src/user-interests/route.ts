import { Elysia } from 'elysia'
import { toRouteError } from '../shared/route-error'
import { ApiRoutePrefixEnum } from '../shared/route-prefixes'
import { StringIdParamsSchema } from '../shared/schema'
import { isUserAdminOrSelf } from '../user/model'
import { betterAuthRoute } from '../utils/auth'
import { db } from '../utils/db'
import { addUserInterest, getUserInterestsWithNames, removeUserInterest } from './model'
import { UserInterestBodySchema } from './validation'

const userInterestsRoutes = new Elysia({
  prefix: ApiRoutePrefixEnum.UserInterests,
})
  .use(betterAuthRoute)
  // Get all interests for a user (admin or self)
  .get(
    '/:id',
    async ({ params, status, user }) => {
      try {
        if (!(await isUserAdminOrSelf(db, params.id, user.id))) return status('Forbidden')

        const interests = await getUserInterestsWithNames(db, params.id)

        return interests
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to list user interests')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true, params: StringIdParamsSchema },
  )
  // Add an interest to a user (admin or self)
  .post(
    '/',
    async ({ body, status, user }) => {
      try {
        if (!(await isUserAdminOrSelf(db, body.userId, user.id))) return status('Forbidden')

        await addUserInterest(db, body)

        return status('Created')
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to add interest')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true, body: UserInterestBodySchema },
  )
  // Remove an interest from a user
  .delete(
    '/',
    async ({ body, user, status }) => {
      try {
        if (!(await isUserAdminOrSelf(db, body.userId, user.id))) return status('Forbidden')

        await removeUserInterest(db, body)
        return { success: true }
      } catch (error) {
        const routeError = toRouteError(error, 'Failed to remove interest')
        return status(routeError.status, routeError.body)
      }
    },
    { auth: true, body: UserInterestBodySchema },
  )

export default userInterestsRoutes
