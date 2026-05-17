import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { createTestDb, initializeTestSchema, type TestDB } from '../__tests__/setup'
import { MatchesTable } from '../matches/schema'
import { UserMetaTable as usersTable } from '../user/schema'

let currentDb: TestDB

mock.module('../utils/db', () => ({
  db: currentDb,
  getDrizzleDb: () => currentDb,
}))

describe('Messages Model DB Integration', () => {
  beforeEach(async () => {
    currentDb = createTestDb()
    await initializeTestSchema(currentDb)

    await currentDb.insert(usersTable).values([
      {
        email: 'msg1@student.babcock.edu.ng',
        isApproved: true,
        isBanned: false,
        isVerified: true,
        password: 'hash',
        role: 'Free',
      },
      {
        email: 'msg2@student.babcock.edu.ng',
        isApproved: true,
        isBanned: false,
        isVerified: true,
        password: 'hash',
        role: 'Free',
      },
      {
        email: 'msg3@student.babcock.edu.ng',
        isApproved: true,
        isBanned: false,
        isVerified: true,
        password: 'hash',
        role: 'Free',
      },
    ])

    await currentDb.insert(MatchesTable).values({ user1Id: '1', user2Id: '2' })
  })

  it('creates message only for match participant', async () => {
    const { createMessage } = await import('./model')

    const created = await createMessage({
      content: 'hello',
      matchId: 1,
      senderId: '1',
    })

    expect(created).toBeDefined()
    if (!created) {
      throw new Error('Expected message to be created')
    }
    expect(created.content).toBe('hello')

    await expect(
      createMessage({
        content: 'not allowed',
        matchId: 1,
        senderId: '3',
      }),
    ).rejects.toThrow('Sender is not a participant in this match')
  })

  it('supports read/update/query access checks', async () => {
    const { canReadMatchMessages, createMessage, getMessagesForMatch, markMessageAsRead } =
      await import('./model')

    const m1 = await createMessage({ content: 'first', matchId: 1, senderId: '1' })
    const m2 = await createMessage({ content: 'second', matchId: 1, senderId: '2' })
    if (!m1 || !m2) {
      throw new Error('Expected seeded messages to be created')
    }

    const paged = await getMessagesForMatch({ limit: 1, matchId: 1 })
    expect(paged.length).toBe(1)

    const updated = await markMessageAsRead(m1.id)
    expect(updated?.isRead).toBe(true)

    expect(await canReadMatchMessages(1, '1')).toBe(true)
    expect(await canReadMatchMessages(1, '3')).toBe(false)
  })
})
