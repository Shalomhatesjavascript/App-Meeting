import { beforeEach, describe, expect, it } from 'bun:test'
import {
  asProductionDB,
  createTestDb,
  initializeTestSchema,
  type TestDB,
} from '../../__tests__/setup'
import { usersTable } from '../../db/schema'
import { createLike, getLikesForUser, getMutualLikes } from './model'

describe('Likes Model DB Integration', () => {
  let db: TestDB

  beforeEach(async () => {
    db = createTestDb()
    await initializeTestSchema(db)

    await db.insert(usersTable).values([
      {
        email: 'u1@student.babcock.edu.ng',
        is_approved: 1,
        is_banned: 0,
        is_verified: 1,
        password_hash: 'hash',
        role: 'free',
      },
      {
        email: 'u2@student.babcock.edu.ng',
        is_approved: 1,
        is_banned: 0,
        is_verified: 1,
        password_hash: 'hash',
        role: 'free',
      },
      {
        email: 'u3@student.babcock.edu.ng',
        is_approved: 1,
        is_banned: 0,
        is_verified: 1,
        password_hash: 'hash',
        role: 'free',
      },
    ])
  })

  it('rejects liking yourself', async () => {
    await expect(
      createLike(asProductionDB(db), {
        from_user_id: 1,
        is_like: true,
        to_user_id: 1,
      }),
    ).rejects.toThrow('You cannot like yourself')
  })

  it('creates match on reciprocal likes', async () => {
    const first = await createLike(asProductionDB(db), {
      from_user_id: 1,
      is_like: true,
      to_user_id: 2,
    })
    expect(first.matched).toBe(false)

    const second = await createLike(asProductionDB(db), {
      from_user_id: 2,
      is_like: true,
      to_user_id: 1,
    })
    expect(second.matched).toBe(true)
    expect(second.match).toBeDefined()
  })

  it('enforces free weekly match limit', async () => {
    await createLike(asProductionDB(db), { from_user_id: 1, is_like: true, to_user_id: 2 })
    const firstMatch = await createLike(asProductionDB(db), {
      from_user_id: 2,
      is_like: true,
      to_user_id: 1,
    })
    expect(firstMatch.matched).toBe(true)

    await createLike(asProductionDB(db), { from_user_id: 1, is_like: true, to_user_id: 3 })
    const secondAttempt = await createLike(asProductionDB(db), {
      from_user_id: 3,
      is_like: true,
      to_user_id: 1,
    })

    expect(secondAttempt.matched).toBe(false)
    expect(secondAttempt.limitReached).toBe(true)
  })

  it('returns sent/received and mutual likes', async () => {
    await createLike(asProductionDB(db), { from_user_id: 1, is_like: true, to_user_id: 2 })
    await createLike(asProductionDB(db), { from_user_id: 2, is_like: true, to_user_id: 1 })

    const sent = await getLikesForUser(asProductionDB(db), 1, 'sent')
    const received = await getLikesForUser(asProductionDB(db), 1, 'received')
    const mutual = await getMutualLikes(asProductionDB(db), 1)

    expect(sent.length).toBeGreaterThan(0)
    expect(received.length).toBeGreaterThan(0)
    expect(mutual.length).toBe(1)
  })
})
