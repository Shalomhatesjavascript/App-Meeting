import type { RequestUser } from './request-auth'

export function isSelfOrAdmin(requester: RequestUser, targetUserId: number): boolean {
  return requester.role === 'admin' || requester.id === targetUserId
}
