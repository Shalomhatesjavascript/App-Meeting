import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test'
import { Elysia } from 'elysia'

let listSubscriptionsImpl: (...args: unknown[]) => Promise<unknown[]> = async () => []
let getSubscriptionByUserIdImpl: (...args: unknown[]) => Promise<unknown> = async () => null
let getSubscriptionByIdImpl: (...args: unknown[]) => Promise<unknown> = async () => null
let createSubscriptionImpl: (...args: unknown[]) => Promise<unknown> = async () => ({ id: 1 })
let updateSubscriptionImpl: (...args: unknown[]) => Promise<unknown> = async () => ({ id: 1 })
let deleteSubscriptionImpl: (...args: unknown[]) => Promise<unknown> = async () => ({
  success: true,
})
const testDb = { test: true }

mock.module('../../db/utils', () => ({
  getDrizzleDb: () => testDb,
}))

mock.module('./model', () => ({
  createSubscription: (...args: unknown[]) => createSubscriptionImpl(...args),
  deleteSubscription: (...args: unknown[]) => deleteSubscriptionImpl(...args),
  getSubscriptionById: (...args: unknown[]) => getSubscriptionByIdImpl(...args),
  getSubscriptionByUserId: (...args: unknown[]) => getSubscriptionByUserIdImpl(...args),
  listSubscriptions: (...args: unknown[]) => listSubscriptionsImpl(...args),
  updateSubscription: (...args: unknown[]) => updateSubscriptionImpl(...args),
}))

describe('Subscriptions Route Handlers', () => {
  let app: Awaited<ReturnType<typeof buildApp>>

  async function buildApp() {
    const { default: subscriptionsRoutes } = await import('./route')
    return new Elysia().use(subscriptionsRoutes)
  }

  beforeAll(async () => {
    app = await buildApp()
  })

  beforeEach(() => {
    listSubscriptionsImpl = async () => [{ id: 1, tier: 'free', user_id: 1 }]
    getSubscriptionByUserIdImpl = async () => ({ id: 1, tier: 'free', user_id: 1 })
    getSubscriptionByIdImpl = async () => ({ id: 1, tier: 'free', user_id: 1 })
    createSubscriptionImpl = async () => ({ id: 2, tier: 'premium', user_id: 1 })
    updateSubscriptionImpl = async () => ({ id: 1, tier: 'premium', user_id: 1 })
    deleteSubscriptionImpl = async () => ({ success: true })
  })

  it('rejects non-admin list access', async () => {
    const res = await app.fetch(
      new Request('http://localhost/subscriptions', {
        headers: { 'x-user-id': '1', 'x-user-role': 'free' },
      }),
    )
    expect(res.status).toBe(403)
  })

  it('gets current user subscription', async () => {
    const res = await app.fetch(
      new Request('http://localhost/subscriptions/me', {
        headers: { 'x-user-id': '1', 'x-user-role': 'free' },
      }),
    )
    expect(res.status).toBe(200)
  })

  it('rejects invalid user id and missing subscription', async () => {
    const invalid = await app.fetch(
      new Request('http://localhost/subscriptions/abc', {
        headers: { 'x-user-id': '99', 'x-user-role': 'admin' },
      }),
    )
    expect(invalid.status).toBe(400)

    getSubscriptionByUserIdImpl = async () => null
    const missing = await app.fetch(
      new Request('http://localhost/subscriptions/1', {
        headers: { 'x-user-id': '99', 'x-user-role': 'admin' },
      }),
    )
    expect(missing.status).toBe(404)
  })

  it('enforces ownership for create/update/delete', async () => {
    const create = await app.fetch(
      new Request('http://localhost/subscriptions', {
        body: JSON.stringify({
          expiry_date: '2026-12-31',
          payment_ref: 'pay_1',
          start_date: '2026-01-01',
          tier: 'premium',
          user_id: 2,
        }),
        headers: { 'content-type': 'application/json', 'x-user-id': '2', 'x-user-role': 'free' },
        method: 'POST',
      }),
    )
    expect(create.status).toBe(200)

    const forbidden = await app.fetch(
      new Request('http://localhost/subscriptions', {
        body: JSON.stringify({
          expiry_date: '2026-12-31',
          payment_ref: 'pay_1',
          start_date: '2026-01-01',
          tier: 'premium',
          user_id: 3,
        }),
        headers: { 'content-type': 'application/json', 'x-user-id': '2', 'x-user-role': 'free' },
        method: 'POST',
      }),
    )
    expect(forbidden.status).toBe(403)

    const update = await app.fetch(
      new Request('http://localhost/subscriptions/1', {
        body: JSON.stringify({ id: 1, tier: 'premium' }),
        headers: { 'content-type': 'application/json', 'x-user-id': '2', 'x-user-role': 'free' },
        method: 'PATCH',
      }),
    )
    expect(update.status).toBe(403)
  })

  it('allows admin to list and delete', async () => {
    const list = await app.fetch(
      new Request('http://localhost/subscriptions', {
        headers: { 'x-user-id': '99', 'x-user-role': 'admin' },
      }),
    )
    expect(list.status).toBe(200)

    const del = await app.fetch(
      new Request('http://localhost/subscriptions/1', {
        headers: { 'x-user-id': '99', 'x-user-role': 'admin' },
        method: 'DELETE',
      }),
    )
    expect(del.status).toBe(200)
  })

  afterAll(() => {
    ;(mock as { restore?: () => void }).restore?.()
  })
})
