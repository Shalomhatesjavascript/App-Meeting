import { createAuthClient } from 'better-auth/react'
import { emailOTPClient } from 'better-auth/client/plugins'
import { frontendEnv } from '../env'

const baseAuthUrl =
  frontendEnv.VITE_BETTER_AUTH_URL || `${frontendEnv.VITE_BACKEND_URL}/api/better-auth`

export const authClient = createAuthClient({
  baseURL: baseAuthUrl,
  plugins: [emailOTPClient()],
  fetchOptions: {
    credentials: 'include',
  },
})
