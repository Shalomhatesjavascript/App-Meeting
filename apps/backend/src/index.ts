import { Elysia } from 'elysia'
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker'
import { setRuntimeEnv } from './lib/runtime-env'
import adminLogsRoutes from './routes/admin-logs/route'
import authRoutes from './routes/auth/route'
import discoveryRoutes from './routes/discovery/route'
import interestsRoutes from './routes/interests/route'
import likesRoutes from './routes/likes/route'
import matchesRoutes from './routes/matches/route'
import messagesRoutes from './routes/messages/route'
import profilesRoutes from './routes/profiles/route'
import subscriptionsRoutes from './routes/subscriptions/route'
import userInterestsRoutes from './routes/user-interests/route'
import usersRoutes from './routes/users/route'

function buildCorsHeaders(origin: string | null): Record<string, string> {
  return {
    'access-control-allow-headers': 'content-type,authorization,x-user-id,x-user-role,x-user-email',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'access-control-allow-origin': origin || '*',
    'access-control-max-age': '86400',
    vary: 'Origin',
  }
}

const app = new Elysia({ adapter: CloudflareAdapter })
  .onRequest(({ request, set }) => {
    const corsHeaders = buildCorsHeaders(request.headers.get('origin'))
    for (const [key, value] of Object.entries(corsHeaders)) {
      set.headers[key] = value
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
        status: 204,
      })
    }
  })
  .get('/health', ({ status }) => status(200))
  .use(authRoutes)
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
  .compile()

export type ElysiaApp = typeof app

export { app }

export default {
  fetch(request: Request, workerEnv: Record<string, unknown>): Response | Promise<Response> {
    setRuntimeEnv(workerEnv)
    return app.fetch(request)
  },
}
