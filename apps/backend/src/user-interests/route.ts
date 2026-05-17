import { Elysia } from 'elysia'
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
      if (!(await isUserAdminOrSelf(db, params.id, user.id))) return status('Forbidden')

      const interests = await getUserInterestsWithNames(db, params.id)

      return interests
    },
    { auth: true, params: StringIdParamsSchema },
  )
  // Add an interest to a user (admin or self)
  .post(
    '/',
    async ({ body, status, user }) => {
      if (!(await isUserAdminOrSelf(db, body.userId, user.id))) return status('Forbidden')

      await addUserInterest(db, body)

      return status('Created')
    },
    { auth: true, body: UserInterestBodySchema },
  )
  // Remove an interest from a user
  .delete(
    '/',
    async ({ body, user, status }) => {
      if (!(await isUserAdminOrSelf(db, body.userId, user.id))) return status('Forbidden')

      await removeUserInterest(db, body)
      return { success: true }
    },
    { auth: true, body: UserInterestBodySchema },
  )

export default userInterestsRoutes
