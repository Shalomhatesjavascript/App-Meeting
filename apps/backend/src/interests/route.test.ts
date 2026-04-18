import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test'
import { Elysia } from 'elysia'

// These tests look like shit >p<

let getAllInterestsImpl: (...args: unknown[]) => Promise<unknown[]> = async () => []
let getInterestByIdImpl: (...args: unknown[]) => Promise<unknown> = async () => null
let createInterestImpl: (...args: unknown[]) => Promise<unknown> = async () => ({ id: 1 })
let updateInterestImpl: (...args: unknown[]) => Promise<unknown> = async () => ({ id: 1 })
let deleteInterestImpl: (...args: unknown[]) => Promise<unknown> = async () => ({ success: true })
const testDb = { test: true }

mock.module('../utils/db', () => ({
  db: testDb,
  getDrizzleDb: () => testDb,
}))

mock.module('./model', () => ({
  createInterest: (...args: unknown[]) => createInterestImpl(...args),
  deleteInterest: (...args: unknown[]) => deleteInterestImpl(...args),
  getAllInterests: (...args: unknown[]) => getAllInterestsImpl(...args),
  getInterestById: (...args: unknown[]) => getInterestByIdImpl(...args),
  updateInterest: (...args: unknown[]) => updateInterestImpl(...args),
}))

describe('Interests Route Handlers', () => {
  let app: Awaited<ReturnType<typeof buildApp>>

  async function buildApp() {
    const { default: interestsRoutes } = await import('./route')
    return new Elysia().use(interestsRoutes)
  }

  beforeAll(async () => {
    app = await buildApp()
  })

  beforeEach(() => {
    getAllInterestsImpl = async () => [{ id: 1, name: 'Coding' }]
    getInterestByIdImpl = async () => ({ id: 1, name: 'Coding' })
    createInterestImpl = async () => ({ id: 2, name: 'Music' })
    updateInterestImpl = async () => ({ id: 1, name: 'Reading' })
    deleteInterestImpl = async () => ({ success: true })
  })

  it('lists interests publicly', async () => {
    const res = await app.fetch(new Request('http://localhost/interests'))
    const body = (await res.json()) as { data?: Array<Record<string, unknown>> }

    expect(res.status).toBe(200)
    expect(body.data).toHaveLength(1)
    expect(body.data?.[0]).toMatchObject({ id: 1, name: 'Coding' })
  })

  it('rejects invalid interest id', async () => {
    const res = await app.fetch(new Request('http://localhost/interests/abc'))
    const body = (await res.json()) as { error?: string }

    expect(res.status).toBe(400)
    expect(body.error).toContain('Invalid interest id')
  })

  it('returns not found for unknown interest', async () => {
    getInterestByIdImpl = async () => null

    const res = await app.fetch(new Request('http://localhost/interests/1'))

    expect(res.status).toBe(404)
  })

  it('requires admin for create/update/delete', async () => {
    const createRes = await app.fetch(
      new Request('http://localhost/interests', {
        body: JSON.stringify({ name: 'Music' }),
        headers: { 'content-type': 'application/json', 'x-user-id': '1', 'x-user-role': 'free' },
        method: 'POST',
      }),
    )

    expect(createRes.status).toBe(403)
  })

  it('creates updates and deletes as admin', async () => {
    const createRes = await app.fetch(
      new Request('http://localhost/interests', {
        body: JSON.stringify({ name: 'Music' }),
        headers: { 'content-type': 'application/json', 'x-user-id': '1', 'x-user-role': 'admin' },
        method: 'POST',
      }),
    )
    expect(createRes.status).toBe(200)

    const updateRes = await app.fetch(
      new Request('http://localhost/interests/1', {
        body: JSON.stringify({ id: 1, name: 'Reading' }),
        headers: { 'content-type': 'application/json', 'x-user-id': '1', 'x-user-role': 'admin' },
        method: 'PUT',
      }),
    )
    expect(updateRes.status).toBe(200)

    const deleteRes = await app.fetch(
      new Request('http://localhost/interests/1', {
        headers: { 'x-user-id': '1', 'x-user-role': 'admin' },
        method: 'DELETE',
      }),
    )
    expect(deleteRes.status).toBe(200)
  })

  afterAll(() => {
    ;(mock as { restore?: () => void }).restore?.()
  })
})
