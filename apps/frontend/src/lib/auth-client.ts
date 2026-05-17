import { emailOTPClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { frontendEnv } from '../env'

const baseAuthUrl =
  frontendEnv.VITE_BETTER_AUTH_URL || `${frontendEnv.VITE_BACKEND_URL}/api/better-auth`

export const authClient = createAuthClient({
  baseURL: baseAuthUrl,
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [emailOTPClient()],
})
