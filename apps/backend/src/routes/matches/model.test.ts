import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { createTestDb, initializeTestSchema, type TestDB } from '../../__tests__/setup'
import { usersTable } from '../../db/schema'

let currentDb: TestDB

mock.module('../../db/utils', () => ({
  getDrizzleDb: () => currentDb,
}))

describe('Matches Model DB Integration', () => {
  beforeEach(async () => {
    currentDb = createTestDb()
    await initializeTestSchema(currentDb)

    await currentDb.insert(usersTable).values([
      {
        email: 'm1@student.babcock.edu.ng',
        is_approved: 1,
        is_banned: 0,
        is_verified: 1,
        password_hash: 'hash',
        role: 'free',
      },
      {
        email: 'm2@student.babcock.edu.ng',
        is_approved: 1,
        is_banned: 0,
        is_verified: 1,
        password_hash: 'hash',
        role: 'free',
      },
      {
        email: 'm3@student.babcock.edu.ng',
        is_approved: 1,
        is_banned: 0,
        is_verified: 1,
        password_hash: 'hash',
        role: 'free',
      },
    ])
  })

  it('creates, fetches, and lists matches', async () => {
    const { createMatch, getMatchById, listMatchesForUser } = await import('./model')

    const created = await createMatch({ user1_id: 1, user2_id: 2 })
    expect(created).toBeDefined()
    if (!created) {
      throw new Error('Expected match to be created')
    }

    const byId = await getMatchById(created.id)
    expect(byId?.id).toBe(created.id)

    const listForUser1 = await listMatchesForUser(1)
    const listForUser3 = await listMatchesForUser(3)

    expect(listForUser1.length).toBe(1)
    expect(listForUser3.length).toBe(0)
  })
})
