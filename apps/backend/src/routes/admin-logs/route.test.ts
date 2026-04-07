import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test'
import { Elysia } from 'elysia'

let listAdminLogsImpl: (...args: unknown[]) => Promise<unknown[]> = async () => []
let getAdminLogByIdImpl: (...args: unknown[]) => Promise<unknown> = async () => null
let createAdminLogImpl: (...args: unknown[]) => Promise<unknown> = async () => ({ id: 1 })
const testDb = { test: true }

mock.module('../../db/utils', () => ({
  getDrizzleDb: () => testDb,
}))

mock.module('./model', () => ({
  createAdminLog: (...args: unknown[]) => createAdminLogImpl(...args),
  getAdminLogById: (...args: unknown[]) => getAdminLogByIdImpl(...args),
  listAdminLogs: (...args: unknown[]) => listAdminLogsImpl(...args),
}))

describe('Admin Logs Route Handlers', () => {
  let app: Awaited<ReturnType<typeof buildApp>>

  async function buildApp() {
    const { default: adminLogsRoutes } = await import('./route')
    return new Elysia().use(adminLogsRoutes)
  }

  beforeAll(async () => {
    app = await buildApp()
  })

  beforeEach(() => {
    listAdminLogsImpl = async () => [{ action: 'seeded demo data', id: 1 }]
    getAdminLogByIdImpl = async () => ({ action: 'seeded demo data', id: 1 })
    createAdminLogImpl = async () => ({ action: 'manual admin action', id: 2 })
  })

  it('rejects non-admins', async () => {
    const res = await app.fetch(
      new Request('http://localhost/admin-logs', {
        headers: { 'x-user-id': '1', 'x-user-role': 'free' },
      }),
    )

    expect(res.status).toBe(403)
  })

  it('lists logs with filters', async () => {
    const res = await app.fetch(
      new Request('http://localhost/admin-logs?action=seeded&admin_id=99&target_user_id=1', {
        headers: { 'x-user-id': '99', 'x-user-role': 'admin' },
      }),
    )
    const body = (await res.json()) as { data?: Array<Record<string, unknown>> }

    expect(res.status).toBe(200)
    expect(body.data).toHaveLength(1)
    expect(body.data?.[0]).toMatchObject({ action: 'seeded demo data' })
  })

  it('returns 400 for invalid id and 404 for missing log', async () => {
    const invalid = await app.fetch(
      new Request('http://localhost/admin-logs/abc', {
        headers: { 'x-user-id': '99', 'x-user-role': 'admin' },
      }),
    )
    expect(invalid.status).toBe(400)

    getAdminLogByIdImpl = async () => null
    const missing = await app.fetch(
      new Request('http://localhost/admin-logs/1', {
        headers: { 'x-user-id': '99', 'x-user-role': 'admin' },
      }),
    )
    expect(missing.status).toBe(404)
  })

  it('creates a log as admin', async () => {
    const res = await app.fetch(
      new Request('http://localhost/admin-logs', {
        body: JSON.stringify({ action: 'manual admin action', admin_id: 99 }),
        headers: { 'content-type': 'application/json', 'x-user-id': '99', 'x-user-role': 'admin' },
        method: 'POST',
      }),
    )

    expect(res.status).toBe(200)
  })

  afterAll(() => {
    ;(mock as { restore?: () => void }).restore?.()
  })
})
