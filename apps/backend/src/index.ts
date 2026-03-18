import { Elysia } from 'elysia'
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker'

const app = new Elysia({ adapter: CloudflareAdapter }).get('/', () => 'Hello Elysia').compile()

export type ElysiaApp = typeof app

export default app
