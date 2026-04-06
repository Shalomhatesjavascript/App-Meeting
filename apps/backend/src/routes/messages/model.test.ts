import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { createTestDb, initializeTestSchema, type TestDB } from '../../__tests__/setup'
import { matchesTable, usersTable } from '../../db/schema'

let currentDb: TestDB

mock.module('../../db/utils', () => ({
  getDrizzleDb: () => currentDb,
}))

describe('Messages Model DB Integration', () => {
  beforeEach(async () => {
    currentDb = createTestDb()
    await initializeTestSchema(currentDb)

    await currentDb.insert(usersTable).values([
      {
        email: 'msg1@student.babcock.edu.ng',
        is_approved: 1,
        is_banned: 0,
        is_verified: 1,
        password_hash: 'hash',
        role: 'free',
      },
      {
        email: 'msg2@student.babcock.edu.ng',
        is_approved: 1,
        is_banned: 0,
        is_verified: 1,
        password_hash: 'hash',
        role: 'free',
      },
      {
        email: 'msg3@student.babcock.edu.ng',
        is_approved: 1,
        is_banned: 0,
        is_verified: 1,
        password_hash: 'hash',
        role: 'free',
      },
    ])

    await currentDb.insert(matchesTable).values({ user1_id: 1, user2_id: 2 })
  })

  it('creates message only for match participant', async () => {
    const { createMessage } = await import('./model')

    const created = await createMessage({
      content: 'hello',
      match_id: 1,
      sender_id: 1,
    })

    expect(created).toBeDefined()
    if (!created) {
      throw new Error('Expected message to be created')
    }
    expect(created.content).toBe('hello')

    await expect(
      createMessage({
        content: 'not allowed',
        match_id: 1,
        sender_id: 3,
      }),
    ).rejects.toThrow('Sender is not a participant in this match')
  })

  it('supports read/update/query access checks', async () => {
    const { canReadMatchMessages, createMessage, getMessagesForMatch, markMessageAsRead } =
      await import('./model')

    const m1 = await createMessage({ content: 'first', match_id: 1, sender_id: 1 })
    const m2 = await createMessage({ content: 'second', match_id: 1, sender_id: 2 })
    if (!m1 || !m2) {
      throw new Error('Expected seeded messages to be created')
    }

    const paged = await getMessagesForMatch({ limit: 1, match_id: 1 })
    expect(paged.length).toBe(1)

    const before = await getMessagesForMatch({ before_id: m2.id, limit: 10, match_id: 1 })
    expect(before.some((m) => m.id === m1.id)).toBe(true)

    const updated = await markMessageAsRead({ id: m1.id })
    expect(updated?.is_read).toBe(1)

    expect(await canReadMatchMessages(1, 1)).toBe(true)
    expect(await canReadMatchMessages(1, 3)).toBe(false)
  })
})
