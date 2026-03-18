import { Elysia } from 'elysia'
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker'
import adminLogsRoutes from './routes/admin-logs/route'
import authRoutes from './routes/auth/route'
import interestsRoutes from './routes/interests/route'
import likesRoutes from './routes/likes/route'
import matchesRoutes from './routes/matches/route'
import messagesRoutes from './routes/messages/route'
import profilesRoutes from './routes/profiles/route'
import subscriptionsRoutes from './routes/subscriptions/route'
import userInterestsRoutes from './routes/user-interests/route'
import usersRoutes from './routes/users/route'

const app = new Elysia({ adapter: CloudflareAdapter })
  .use(authRoutes)
  .use(usersRoutes)
  .use(profilesRoutes)
  .use(interestsRoutes)
  .use(userInterestsRoutes)
  .use(likesRoutes)
  .use(matchesRoutes)
  .use(messagesRoutes)
  .use(subscriptionsRoutes)
  .use(adminLogsRoutes)
  .get('/', () => 'Hello Elysia')
  .compile()

export type ElysiaApp = typeof app

export default app
