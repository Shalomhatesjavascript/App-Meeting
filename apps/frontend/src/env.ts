import * as v from 'valibot'

export const FrontendEnvSchema = v.looseObject({
  VITE_BACKEND_URL: v.pipe(v.string(), v.trim(), v.url()),
})

export type FrontendEnv = v.InferOutput<typeof FrontendEnvSchema>

export const frontendEnv = v.parse(FrontendEnvSchema, import.meta.env)
