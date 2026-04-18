import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { createTestDb, initializeTestSchema, type TestDB } from '../__tests__/setup'
import { UserMetaTable } from '../user/schema'

let currentDb: TestDB

mock.module('../utils/db', () => ({
  db: currentDb,
  getDrizzleDb: () => currentDb,
}))

describe('Matches Model DB Integration', () => {
  beforeEach(async () => {
    currentDb = createTestDb()
    await initializeTestSchema(currentDb)

    await currentDb.insert(UserMetaTable).values([
      {
        email: 'm1@student.babcock.edu.ng',
        password: 'hash',
      },
      {
        email: 'm2@student.babcock.edu.ng',
        password: 'hash',
      },
      {
        email: 'm3@student.babcock.edu.ng',
        password: 'hash',
      },
    ])
  })

  it('creates, fetches, and lists matches', async () => {
    const { createMatch, getMatchById, listMatchesForUser } = await import('./model')

    const created = await createMatch({ user1Id: 1, user2Id: 2 })
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
