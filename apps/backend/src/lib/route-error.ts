type RouteErrorResponse = {
  status: number
  body: {
    error: string
    reason: string
  }
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim()
  }

  if (typeof error === 'string' && error.trim()) {
    return error.trim()
  }

  return fallback
}

function inferStatus(message: string, fallbackStatus: number): number {
  const normalized = message.toLowerCase()

  if (normalized.includes('authentication required') || normalized.includes('unauthorized')) {
    return 401
  }

  if (
    normalized.includes('access denied') ||
    normalized.includes('forbidden') ||
    normalized.includes('admin access required')
  ) {
    return 403
  }

  if (normalized.includes('not found') || normalized.includes('missing')) {
    return 404
  }

  if (
    normalized.includes('invalid') ||
    normalized.includes('validation') ||
    normalized.includes('must be') ||
    normalized.includes('bad request')
  ) {
    return 400
  }

  return fallbackStatus
}

export function toRouteError(
  error: unknown,
  fallbackMessage: string,
  fallbackStatus = 500,
): RouteErrorResponse {
  const message = extractErrorMessage(error, fallbackMessage)
  return {
    body: {
      error: message,
      reason: message,
    },
    status: inferStatus(message, fallbackStatus),
  }
}
