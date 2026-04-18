import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test'
import { Elysia } from 'elysia'

let getUserInterestsWithNamesImpl: (...args: unknown[]) => Promise<unknown[]> = async () => []
let addUserInterestImpl: (...args: unknown[]) => Promise<unknown> = async () => ({ success: true })
let removeUserInterestImpl: (...args: unknown[]) => Promise<unknown> = async () => ({
  success: true,
})
const testDb = { test: true }

mock.module('../utils/db', () => ({
  db: testDb,
  getDrizzleDb: () => testDb,
}))

mock.module('./model', () => ({
  addUserInterest: (...args: unknown[]) => addUserInterestImpl(...args),
  getUserInterestsWithNames: (...args: unknown[]) => getUserInterestsWithNamesImpl(...args),
  removeUserInterest: (...args: unknown[]) => removeUserInterestImpl(...args),
}))

describe('User Interests Route Handlers', () => {
  let app: Awaited<ReturnType<typeof buildApp>>

  async function buildApp() {
    const { default: userInterestsRoutes } = await import('./route')
    return new Elysia().use(userInterestsRoutes)
  }

  beforeAll(async () => {
    app = await buildApp()
  })

  beforeEach(() => {
    getUserInterestsWithNamesImpl = async () => [{ interest_id: 1, name: 'Coding' }]
    addUserInterestImpl = async () => ({ success: true })
    removeUserInterestImpl = async () => ({ success: true })
  })

  it('lists user interests publicly by id', async () => {
    const res = await app.fetch(new Request('http://localhost/user-interests/1'))
    expect(res.status).toBe(200)
  })

  it('rejects invalid user id', async () => {
    const res = await app.fetch(new Request('http://localhost/user-interests/abc'))
    expect(res.status).toBe(400)
  })

  it('requires ownership or admin for add/remove', async () => {
    const res = await app.fetch(
      new Request('http://localhost/user-interests', {
        body: JSON.stringify({ interest_id: 1, user_id: 2 }),
        headers: { 'content-type': 'application/json', 'x-user-id': '1', 'x-user-role': 'free' },
        method: 'POST',
      }),
    )
    expect(res.status).toBe(403)
  })

  it('adds and removes as the same user', async () => {
    const add = await app.fetch(
      new Request('http://localhost/user-interests', {
        body: JSON.stringify({ interest_id: 1, user_id: 1 }),
        headers: { 'content-type': 'application/json', 'x-user-id': '1', 'x-user-role': 'free' },
        method: 'POST',
      }),
    )
    expect(add.status).toBe(200)

    const remove = await app.fetch(
      new Request('http://localhost/user-interests', {
        body: JSON.stringify({ interest_id: 1, user_id: 1 }),
        headers: { 'content-type': 'application/json', 'x-user-id': '1', 'x-user-role': 'free' },
        method: 'DELETE',
      }),
    )
    expect(remove.status).toBe(200)
  })

  afterAll(() => {
    ;(mock as { restore?: () => void }).restore?.()
  })
})
