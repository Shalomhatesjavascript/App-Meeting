import cors from '@elysiajs/cors'
import { Elysia } from 'elysia'
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker'
import adminLogsRoutes from './admin-logs/route'
import discoveryRoutes from './discovery/route'
import interestsRoutes from './interests/route'
import likesRoutes from './likes/route'
import matchesRoutes from './matches/route'
import messagesRoutes from './messages/route'
import profilesRoutes from './profiles/route'
import { BackendEnv } from './shared/env'
import subscriptionsRoutes from './subscriptions/route'
import usersRoutes from './user/route'
import userInterestsRoutes from './user-interests/route'
import { betterAuthRoute } from './utils/auth'

export type { DiscoveryCandidate } from './discovery/matching'
export type { MatchInsertDB, MatchSelectDB, MatchUpdateDB } from './matches/schema'
export type { MessageInsertDB, MessageSelectDB, MessageUpdateDB } from './messages/schema'
export type { ProfileInsertDB, ProfileSelectDB, ProfileUpdateDB } from './profiles/schema'
export type {
  UserMetaInsertDB,
  UserMetaSelectDB,
  UserMetaUpdateDB,
  UserSelectDB,
  UserWithMetaSelectDB,
  UserWithMetaUpdateDB,
} from './user/schema'
export type { UserEmailSignUpOutput } from './user/validation'

const allowAllInDev = BackendEnv.NODE_ENV !== 'production'

const app = new Elysia({ adapter: CloudflareAdapter })
  .use(
    cors({
      origin: allowAllInDev ? true : BackendEnv.FRONTEND_URL,
    }),
  )
  .get('/health', ({ status }) => status(200))
  .use(betterAuthRoute)
  .use(usersRoutes)
  .use(profilesRoutes)
  .use(interestsRoutes)
  .use(userInterestsRoutes)
  .use(likesRoutes)
  .use(matchesRoutes)
  .use(messagesRoutes)
  .use(subscriptionsRoutes)
  .use(discoveryRoutes)
  .use(adminLogsRoutes)
  .onError((ctx) => {
    if (ctx.code === 500) {
      console.error(ctx)
    }
  })
  .compile()

export type ElysiaApp = typeof app

export { app }

export default {
  async fetch(request: Request): Promise<Response> {
    return app.fetch(request)
  },
}
