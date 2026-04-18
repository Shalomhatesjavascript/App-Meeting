import { beforeEach, describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'
import { createTestDb, initializeTestSchema } from '../__tests__/setup'
import { UserMetaRoleEnum } from '../user/enum'
import { UserMetaTable } from '../user/schema'

let currentDb = createTestDb()

describe('Profiles Route Handlers', () => {
  let app: Awaited<ReturnType<typeof buildApp>>

  async function buildApp() {
    const { default: profilesRoutes } = await import('./route')
    return new Elysia().use(profilesRoutes)
  }

  beforeEach(async () => {
    currentDb = createTestDb()
    await initializeTestSchema(currentDb)

    await currentDb.insert(UserMetaTable).values([
      {
        email: 'profile1@student.babcock.edu.ng',
        isApproved: true,
        isBanned: false,
        isVerified: true,
        password: 'hash',
        role: UserMetaRoleEnum.Free,
      },
      {
        email: 'profile2@student.babcock.edu.ng',
        isApproved: true,
        isBanned: false,
        isVerified: true,
        password: 'hash',
        role: UserMetaRoleEnum.Free,
      },
    ])

    app = await buildApp()
  })

  it('returns current profile and 404 when missing', async () => {
    const current = await app.fetch(
      new Request('http://localhost/profiles/me', {
        headers: { 'x-user-id': '1', 'x-user-role': 'free' },
      }),
    )
    expect(current.status).toBe(404)

    await app.fetch(
      new Request('http://localhost/profiles', {
        body: JSON.stringify({
          alias: 'Ada',
          department: 'Computer Science',
          full_name: 'Ada Lovelace',
          gender: 'female',
          intent: 'friendship',
          level: 300,
        }),
        headers: { 'content-type': 'application/json', 'x-user-id': '1', 'x-user-role': 'free' },
        method: 'POST',
      }),
    )

    const loaded = await app.fetch(
      new Request('http://localhost/profiles/me', {
        headers: { 'x-user-id': '1', 'x-user-role': 'free' },
      }),
    )
    expect(loaded.status).toBe(200)
  })

  it('rejects invalid profile id and allows create/update/delete flows', async () => {
    const invalid = await app.fetch(new Request('http://localhost/profiles/abc'))
    expect(invalid.status).toBe(400)

    const create = await app.fetch(
      new Request('http://localhost/profiles', {
        body: JSON.stringify({
          alias: 'Ada',
          department: 'CS',
          full_name: 'Ada Lovelace',
          gender: 'female',
          intent: 'friendship',
          level: 300,
        }),
        headers: { 'content-type': 'application/json', 'x-user-id': '1', 'x-user-role': 'free' },
        method: 'POST',
      }),
    )
    expect(create.status).toBe(200)

    const update = await app.fetch(
      new Request('http://localhost/profiles/1', {
        body: JSON.stringify({ alias: 'Ada Lovelace' }),
        headers: { 'content-type': 'application/json', 'x-user-id': '1', 'x-user-role': 'free' },
        method: 'PUT',
      }),
    )
    expect(update.status).toBe(200)

    const del = await app.fetch(
      new Request('http://localhost/profiles/1', {
        headers: { 'x-user-id': '1', 'x-user-role': 'free' },
        method: 'DELETE',
      }),
    )
    expect(del.status).toBe(200)
  })

  it('enforces ownership on update/delete', async () => {
    const update = await app.fetch(
      new Request('http://localhost/profiles/1', {
        body: JSON.stringify({ alias: 'Denied' }),
        headers: { 'content-type': 'application/json', 'x-user-id': '2', 'x-user-role': 'free' },
        method: 'PUT',
      }),
    )
    expect(update.status).toBe(403)

    const del = await app.fetch(
      new Request('http://localhost/profiles/1', {
        headers: { 'x-user-id': '2', 'x-user-role': 'free' },
        method: 'DELETE',
      }),
    )
    expect(del.status).toBe(403)
  })
})
