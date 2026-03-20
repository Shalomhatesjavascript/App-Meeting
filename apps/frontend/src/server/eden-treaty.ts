import { treaty } from '@elysiajs/eden'
import type { ElysiaApp } from '@repo/backend'

/** Backend api exposed via eden treaty.
 *
 * All your api calls to the backend must be called via this
 */
const api = treaty<ElysiaApp>(import.meta.env.VITE_BACKEND_URL || '')

export default api
