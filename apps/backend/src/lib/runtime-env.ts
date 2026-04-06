type RuntimeEnv = Record<string, unknown>

let runtimeEnv: RuntimeEnv | undefined

export function setRuntimeEnv(nextEnv: RuntimeEnv | undefined): void {
  if (nextEnv) {
    runtimeEnv = nextEnv
  }
}

export function getRuntimeBinding<T>(key: string): T | undefined {
  const value = runtimeEnv?.[key]
  return value as T | undefined
}

export function getRuntimeString(key: string): string | undefined {
  const value = runtimeEnv?.[key]
  if (typeof value === 'string' && value.length > 0) {
    return value
  }

  const processValue = process.env[key]
  return processValue && processValue.length > 0 ? processValue : undefined
}
