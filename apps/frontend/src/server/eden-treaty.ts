import { treaty } from '@elysiajs/eden'
import type { ElysiaApp } from '@repo/backend'
import { frontendEnv } from '../env'

/** Backend api exposed via eden treaty.
 *
 * All your api calls to the backend must be called via this
 */
const api = treaty<ElysiaApp>(frontendEnv.VITE_BACKEND_URL, {
  fetch: {
    credentials: 'include',
  },
})

export default api
