import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test'
import { Elysia } from 'elysia'

let getDiscoveryFeedImpl: (...args: unknown[]) => Promise<unknown[]> = async () => []
let getRecommendationsImpl: (...args: unknown[]) => Promise<unknown[]> = async () => []
let getPossibleMatchesImpl: (...args: unknown[]) => Promise<unknown[]> = async () => []
const testDb = { test: true }

mock.module('../utils/db', () => ({
  db: testDb,
  getDrizzleDb: () => testDb,
}))

mock.module('./model', () => ({
  getDiscoveryFeed: (...args: unknown[]) => getDiscoveryFeedImpl(...args),
  getPossibleMatches: (...args: unknown[]) => getPossibleMatchesImpl(...args),
  getRecommendations: (...args: unknown[]) => getRecommendationsImpl(...args),
}))

describe('Discovery Route Handlers', () => {
  let app: Awaited<ReturnType<typeof buildApp>>

  async function buildApp() {
    const { default: discoveryRoutes } = await import('./route')
    return new Elysia().use(discoveryRoutes)
  }

  beforeAll(async () => {
    app = await buildApp()
  })

  beforeEach(() => {
    getDiscoveryFeedImpl = async () => []
    getRecommendationsImpl = async () => []
    getPossibleMatchesImpl = async () => []
  })

  it('requires authentication', async () => {
    const res = await app.fetch(new Request('http://localhost/discovery/candidates'))
    const body = (await res.json()) as { error?: string }

    expect(res.status).toBe(401)
    expect(body.error).toContain('Authentication required')
  })

  it('passes parsed pagination and clamps limit to 100', async () => {
    const calls: unknown[][] = []
    getDiscoveryFeedImpl = async (...args: unknown[]) => {
      calls.push(args)
      return []
    }

    const res = await app.fetch(
      new Request('http://localhost/discovery/candidates?limit=500&offset=7', {
        headers: {
          'x-user-id': '42',
          'x-user-role': 'free',
        },
      }),
    )
    const body = (await res.json()) as { data?: unknown[] }

    expect(res.status).toBe(200)
    expect(Array.isArray(body.data)).toBe(true)
    expect(calls).toHaveLength(1)

    const [dbArg, userIdArg, limitArg, offsetArg] = calls[0] || []
    expect(dbArg).toBe(testDb)
    expect(userIdArg).toBe(42)
    expect(limitArg).toBe(100)
    expect(offsetArg).toBe(7)
  })

  it('returns recommendations from the dedicated endpoint', async () => {
    const calls: unknown[][] = []
    getRecommendationsImpl = async (...args: unknown[]) => {
      calls.push(args)
      return [{ score: 220, userId: 99 }]
    }

    const res = await app.fetch(
      new Request('http://localhost/discovery/recommendations?limit=200&offset=3', {
        headers: { 'x-user-id': '5', 'x-user-role': 'free' },
      }),
    )
    const body = (await res.json()) as { data?: Array<Record<string, unknown>> }

    expect(res.status).toBe(200)
    expect(body.data).toHaveLength(1)
    expect(body.data?.[0]).toMatchObject({ score: 220, userId: 99 })

    const [dbArg, userIdArg, limitArg, offsetArg] = calls[0] || []
    expect(dbArg).toBe(testDb)
    expect(userIdArg).toBe(5)
    expect(limitArg).toBe(100)
    expect(offsetArg).toBe(3)
  })

  it('returns possible matches and forwards minScore filter', async () => {
    const calls: unknown[][] = []
    getPossibleMatchesImpl = async (...args: unknown[]) => {
      calls.push(args)
      return [{ score: 300, userId: 33 }]
    }

    const res = await app.fetch(
      new Request('http://localhost/discovery/possible-matches?limit=40&offset=2&minScore=250', {
        headers: { 'x-user-id': '12', 'x-user-role': 'free' },
      }),
    )
    const body = (await res.json()) as { data?: Array<Record<string, unknown>> }

    expect(res.status).toBe(200)
    expect(body.data).toHaveLength(1)
    expect(body.data?.[0]).toMatchObject({ score: 300, userId: 33 })

    const [dbArg, userIdArg, limitArg, offsetArg, minScoreArg] = calls[0] || []
    expect(dbArg).toBe(testDb)
    expect(userIdArg).toBe(12)
    expect(limitArg).toBe(40)
    expect(offsetArg).toBe(2)
    expect(minScoreArg).toBe(250)
  })

  it('returns recommendation response shape', async () => {
    getDiscoveryFeedImpl = async () => [
      {
        alias: 'Ada',
        bio: 'Bio',
        department: 'Computer Science',
        email: 'ada@student.babcock.edu.ng',
        gender: 'female',
        intent: 'dating',
        interestNames: ['coding', 'hiking'],
        level: 300,
        score: 280,
        sharedInterestCount: 2,
        userId: 11,
      },
    ]

    const res = await app.fetch(
      new Request('http://localhost/discovery/candidates', {
        headers: { 'x-user-id': '1', 'x-user-role': 'free' },
      }),
    )
    const body = (await res.json()) as { data?: Array<Record<string, unknown>> }

    expect(res.status).toBe(200)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data).toHaveLength(1)
    const first = body.data?.[0]
    expect(first).toBeDefined()
    expect(first).toMatchObject({
      interestNames: ['coding', 'hiking'],
      score: 280,
      userId: 11,
    })
  })

  afterAll(() => {
    ;(mock as { restore?: () => void }).restore?.()
  })
})
