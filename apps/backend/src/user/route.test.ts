import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test'
import { Elysia } from 'elysia'
import * as v from 'valibot'

type SearchResult = {
  userId: number
  email: string
  alias: string
  bio: string | null
  department: string
  gender: string
  intent: string
  level: number
}

const ErrorResponseSchema = v.object({
  error: v.optional(v.string()),
})

const SearchResultSchema = v.object({
  alias: v.string(),
  bio: v.nullable(v.string()),
  department: v.string(),
  email: v.string(),
  gender: v.string(),
  intent: v.string(),
  level: v.number(),
  userId: v.number(),
})

const SearchResponseSchema = v.object({
  data: v.optional(v.array(SearchResultSchema)),
})

let listUsersImpl: (...args: unknown[]) => Promise<unknown[]> = async () => []
let searchUsersImpl: (...args: unknown[]) => Promise<SearchResult[]> = async () => []

const testDb = { test: true }

mock.module('../utils/db', () => ({
  db: testDb,
  getDrizzleDb: () => testDb,
}))

mock.module('./model', async () => {
  return {
    adminActionUser: async () => ({
      email: 'admin-action@student.babcock.edu.ng',
      id: 1,
      isApproved: 1,
      isBanned: 0,
      isVerified: 1,
      lastLoginAt: null,
      password: 'hash',
      role: 'Free',
    }),
    createUser: async () => ({
      email: 'created@student.babcock.edu.ng',
      id: 1,
      isApproved: 1,
      isBanned: 0,
      isVerified: 0,
      lastLoginAt: null,
      password: 'hash',
      role: 'Free',
    }),
    deleteUser: async () => ({ success: true }),
    getUserById: async () => null,
    getUserRole: async () => 'Admin',
    getUserStats: async () => ({ likesGiven: 0, likesReceived: 0, matches: 0, messagesSent: 0 }),
    isUserAdmin: async () => true,
    isUserAdminOrSelf: async () => true,
    listUsers: (...args: unknown[]) => listUsersImpl(...args),
    searchUsers: (...args: unknown[]) => searchUsersImpl(...args),
    updateUser: async () => null,
  }
})

describe('Users Route Search', () => {
  let app: Awaited<ReturnType<typeof buildApp>>

  async function buildApp() {
    const { default: usersRoutes } = await import('./route')
    return new Elysia().use(usersRoutes)
  }

  beforeAll(async () => {
    app = await buildApp()
  })

  beforeEach(() => {
    searchUsersImpl = async () => []
  })

  it('requires authentication', async () => {
    const res = await app.fetch(new Request('http://localhost/users/search?q=ada'))
    const body = v.parse(ErrorResponseSchema, await res.json())

    expect(res.status).toBe(401)
    expect(body.error).toContain('Authentication required')
  })

  it('requires q query parameter', async () => {
    const res = await app.fetch(
      new Request('http://localhost/users/search', {
        headers: { 'x-user-id': '1' },
      }),
    )
    const body = v.parse(ErrorResponseSchema, await res.json())

    expect(res.status).toBe(400)
    expect(body.error).toBe('q is required')
  })

  it('forwards query, limit, offset, and returns data', async () => {
    const calls: unknown[][] = []
    searchUsersImpl = async (...args: unknown[]) => {
      calls.push(args)
      return [
        {
          alias: 'Ada',
          bio: 'Love coding',
          department: 'Computer Science',
          email: 'ada@student.babcock.edu.ng',
          gender: 'female',
          intent: 'dating',
          level: 300,
          userId: 22,
        },
      ]
    }

    const res = await app.fetch(
      new Request('http://localhost/users/search?q=ada&limit=500&offset=4', {
        headers: { 'x-user-id': '3', 'x-user-role': 'free' },
      }),
    )
    const body = v.parse(SearchResponseSchema, await res.json())

    expect(res.status).toBe(200)
    expect(body.data).toHaveLength(1)
    expect(body.data?.[0]).toMatchObject({ alias: 'Ada', userId: 22 })

    const [dbArg, requesterIdArg, queryArg, limitArg, offsetArg] = calls[0] || []
    expect(dbArg).toBe(testDb)
    expect(requesterIdArg).toBe(3)
    expect(queryArg).toBe('ada')
    expect(limitArg).toBe(100)
    expect(offsetArg).toBe(4)
  })

  it('supports paginated user listing for admins', async () => {
    const calls: unknown[][] = []
    listUsersImpl = async (...args: unknown[]) => {
      calls.push(args)
      return [{ id: '1', meta: { isApproved: 1, isBanned: 0, isVerified: 1, userId: '1' } }]
    }

    const res = await app.fetch(
      new Request('http://localhost/users?limit=25&offset=10', {
        headers: { 'x-user-id': '1', 'x-user-role': 'admin' },
      }),
    )

    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual([
      { id: '1', meta: { isApproved: 1, isBanned: 0, isVerified: 1, userId: '1' } },
    ])
    expect(calls[0]?.[1]).toMatchObject({ limit: 25, offset: 10 })
  })

  afterAll(() => {
    ;(mock as { restore?: () => void }).restore?.()
  })
})
