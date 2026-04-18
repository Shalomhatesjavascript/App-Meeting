import { beforeEach, describe, expect, it } from 'bun:test'
import { asProductionDB, createTestDb, initializeTestSchema, type TestDB } from '../__tests__/setup'
import { UserMetaTable as usersTable } from '../user/schema'
import { createOrUpdateLike, getLikesForUser, getMutualLikes } from './model'

describe('Likes Model DB Integration', () => {
  let db: TestDB

  beforeEach(async () => {
    db = createTestDb()
    await initializeTestSchema(db)

    await db.insert(usersTable).values([
      {
        email: 'u1@student.babcock.edu.ng',
        isApproved: true,
        isBanned: false,
        isVerified: true,
        password: 'hash',
        role: 'Free',
      },
      {
        email: 'u2@student.babcock.edu.ng',
        isApproved: true,
        isBanned: false,
        isVerified: true,
        password: 'hash',
        role: 'Free',
      },
      {
        email: 'u3@student.babcock.edu.ng',
        isApproved: true,
        isBanned: false,
        isVerified: true,
        password: 'hash',
        role: 'Free',
      },
    ])
  })

  it('rejects liking yourself', async () => {
    await expect(
      createOrUpdateLike(asProductionDB(db), {
        fromUserId: 1,
        isLike: true,
        toUserId: 1,
      }),
    ).rejects.toThrow('You cannot like yourself')
  })

  it('creates match on reciprocal likes', async () => {
    const first = await createOrUpdateLike(asProductionDB(db), {
      fromUserId: 1,
      isLike: true,
      toUserId: 2,
    })
    expect(!!first.match).toBe(false)

    const second = await createOrUpdateLike(asProductionDB(db), {
      fromUserId: 2,
      isLike: true,
      toUserId: 1,
    })
    expect(!!second.match).toBe(true)
    expect(second.match).toBeDefined()
  })

  it('enforces free weekly match limit', async () => {
    await createOrUpdateLike(asProductionDB(db), { fromUserId: 1, isLike: true, toUserId: 2 })
    const firstMatch = await createOrUpdateLike(asProductionDB(db), {
      fromUserId: 2,
      isLike: true,
      toUserId: 1,
    })
    expect(!!firstMatch.match).toBe(true)

    await createOrUpdateLike(asProductionDB(db), { fromUserId: 1, isLike: true, toUserId: 3 })
    const secondAttempt = await createOrUpdateLike(asProductionDB(db), {
      fromUserId: 3,
      isLike: true,
      toUserId: 1,
    })

    expect(secondAttempt.isLimitReached).toBe(true)
  })

  it('returns sent/received and mutual likes', async () => {
    await createOrUpdateLike(asProductionDB(db), { fromUserId: 1, isLike: true, toUserId: 2 })
    await createOrUpdateLike(asProductionDB(db), { fromUserId: 2, isLike: true, toUserId: 1 })

    const sent = await getLikesForUser(asProductionDB(db), 1, 'sent')
    const received = await getLikesForUser(asProductionDB(db), 1, 'received')
    const mutual = await getMutualLikes(asProductionDB(db), 1)

    expect(sent.length).toBeGreaterThan(0)
    expect(received.length).toBeGreaterThan(0)
    expect(mutual.length).toBe(1)
  })
})
