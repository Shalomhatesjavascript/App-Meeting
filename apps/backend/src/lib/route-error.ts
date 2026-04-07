import { type AuthErrorCode, AuthErrorCodeEnum } from './auth-enums'

type RouteErrorResponse = {
  status: number
  body: {
    code?: AuthErrorCode
    error: string
    reason: string
  }
}

type RouteError = {
  code: AuthErrorCode
  message: string
}

const routeStatusByCode = {
  [AuthErrorCodeEnum.AUTHENTICATION_REQUIRED]: 401,
  [AuthErrorCodeEnum.CONFLICT]: 409,
  [AuthErrorCodeEnum.FORBIDDEN]: 403,
  [AuthErrorCodeEnum.INTERNAL_ERROR]: 500,
  [AuthErrorCodeEnum.NOT_FOUND]: 404,
  [AuthErrorCodeEnum.VALIDATION_ERROR]: 400,
} as const satisfies Record<AuthErrorCode, number>

export function createRouteError(code: AuthErrorCode, message: string): RouteError {
  return { code, message }
}

export function getRouteErrorStatus(code: AuthErrorCode): number {
  return routeStatusByCode[code]
}

function isRouteError(value: unknown): value is RouteError {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Partial<RouteError>
  return typeof candidate.code === 'string' && typeof candidate.message === 'string'
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim()
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    const message = (error as { message: string }).message.trim()
    if (message) {
      return message
    }
  }

  if (typeof error === 'string' && error.trim()) {
    return error.trim()
  }

  return fallback
}

export function toRouteError(
  error: unknown,
  fallbackMessage: string,
  fallbackStatus = 500,
): RouteErrorResponse {
  if (isRouteError(error)) {
    return {
      body: {
        code: error.code,
        error: error.message,
        reason: error.message,
      },
      status: routeStatusByCode[error.code] ?? fallbackStatus,
    }
  }

  const message = extractErrorMessage(error, fallbackMessage)
  return {
    body: {
      error: message,
      reason: message,
    },
    status: fallbackStatus,
  }
}
