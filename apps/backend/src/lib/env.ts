import * as v from 'valibot'

export const BackendDrizzleEnvSchema = v.looseObject({
  CLOUDFLARE_ACCOUNT_ID: v.pipe(v.string(), v.trim(), v.minLength(1)),
  CLOUDFLARE_D1_TOKEN: v.pipe(v.string(), v.trim(), v.minLength(1)),
  CLOUDFLARE_DATABASE_ID: v.pipe(v.string(), v.trim(), v.minLength(1)),
})

export type BackendDrizzleEnv = v.InferOutput<typeof BackendDrizzleEnvSchema>

export function loadBackendDrizzleEnv(
  env: Record<string, unknown> = process.env,
): BackendDrizzleEnv {
  return v.parse(BackendDrizzleEnvSchema, env)
}
