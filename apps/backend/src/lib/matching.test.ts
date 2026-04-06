import { beforeEach, describe, expect, it } from 'bun:test'
import {
  createInterest,
  createLike,
  createProfile,
  createUser,
  linkUserInterest,
} from '../__tests__/fixtures'
import type { TestDB } from '../__tests__/setup'
import { asProductionDB, createTestDb, initializeTestSchema } from '../__tests__/setup'
import { calculateScore, getDiscoveryCandidates } from './matching'

describe('matching.calculateScore', () => {
  it('scores shared interests as highest weight', () => {
    const current = { department: 'CS', gender: 'male', intent: 'dating' }
    const candidate = { department: 'CS', gender: 'male', intent: 'dating' }

    expect(calculateScore(current, candidate, 0)).toBe(80)
    expect(calculateScore(current, candidate, 1)).toBe(180)
    expect(calculateScore(current, candidate, 2)).toBe(280)
  })

  it('combines all factors correctly', () => {
    const current = { department: 'CS', gender: 'male', intent: 'dating' }
    const candidate = { department: 'CS', gender: 'male', intent: 'dating' }

    expect(calculateScore(current, candidate, 3)).toBe(380)
  })
})

describe('matching.getDiscoveryCandidates', () => {
  let db: TestDB

  beforeEach(async () => {
    db = createTestDb()
    await initializeTestSchema(db)
  })

  it('returns empty when current user has no profile', async () => {
    const userId = await createUser(db, 'user1@student.babcock.edu.ng', true)
    const candidates = await getDiscoveryCandidates(asProductionDB(db), userId)
    expect(candidates).toEqual([])
  })

  it('excludes unverified users from recommendations', async () => {
    const currentId = await createUser(db, 'me@student.babcock.edu.ng', true)
    await createProfile(db, currentId, {
      alias: 'Me',
      department: 'CS',
      gender: 'male',
      intent: 'dating',
    })

    const unverifiedId = await createUser(db, 'unverified@student.babcock.edu.ng', false)
    await createProfile(db, unverifiedId, {
      alias: 'Unverified',
      department: 'CS',
      gender: 'female',
      intent: 'dating',
    })

    const candidates = await getDiscoveryCandidates(asProductionDB(db), currentId)
    expect(candidates).toHaveLength(0)
  })

  it('excludes already-liked users from recommendations', async () => {
    const currentId = await createUser(db, 'me@student.babcock.edu.ng', true)
    await createProfile(db, currentId, {
      alias: 'Me',
      department: 'CS',
      gender: 'male',
      intent: 'dating',
    })

    const likedId = await createUser(db, 'liked@student.babcock.edu.ng', true)
    await createProfile(db, likedId, {
      alias: 'Liked',
      department: 'CS',
      gender: 'female',
      intent: 'dating',
    })

    await createLike(db, currentId, likedId)

    const candidates = await getDiscoveryCandidates(asProductionDB(db), currentId)
    expect(candidates).toHaveLength(0)
  })

  it('orders candidates by score descending', async () => {
    const currentId = await createUser(db, 'me@student.babcock.edu.ng', true)
    await createProfile(db, currentId, {
      alias: 'Me',
      department: 'CS',
      gender: 'male',
      intent: 'dating',
    })

    const coding = await createInterest(db, 'coding')
    const hiking = await createInterest(db, 'hiking')
    await linkUserInterest(db, currentId, coding)
    await linkUserInterest(db, currentId, hiking)

    const highId = await createUser(db, 'high@student.babcock.edu.ng', true)
    await createProfile(db, highId, {
      alias: 'High',
      department: 'CS',
      gender: 'male',
      intent: 'dating',
    })
    await linkUserInterest(db, highId, coding)
    await linkUserInterest(db, highId, hiking)

    const lowId = await createUser(db, 'low@student.babcock.edu.ng', true)
    await createProfile(db, lowId, {
      alias: 'Low',
      department: 'Other',
      gender: 'male',
      intent: 'friendship',
    })
    await linkUserInterest(db, lowId, coding)

    const candidates = await getDiscoveryCandidates(asProductionDB(db), currentId)
    expect(candidates).toHaveLength(2)

    const first = candidates[0]
    const second = candidates[1]
    if (!first || !second) {
      throw new Error('Expected two candidates')
    }

    expect(first.userId).toBe(highId)
    expect(second.userId).toBe(lowId)
    expect(first.score).toBeGreaterThan(second.score)
  })

  it('returns interest names for recommendation cards', async () => {
    const currentId = await createUser(db, 'me@student.babcock.edu.ng', true)
    await createProfile(db, currentId, {
      alias: 'Me',
      department: 'CS',
      gender: 'male',
      intent: 'dating',
    })

    const coding = await createInterest(db, 'coding')
    const hiking = await createInterest(db, 'hiking')

    const candidateId = await createUser(db, 'cand@student.babcock.edu.ng', true)
    await createProfile(db, candidateId, {
      alias: 'Candidate',
      department: 'CS',
      gender: 'female',
      intent: 'dating',
    })
    await linkUserInterest(db, candidateId, coding)
    await linkUserInterest(db, candidateId, hiking)

    const candidates = await getDiscoveryCandidates(asProductionDB(db), currentId)
    expect(candidates).toHaveLength(1)

    const first = candidates[0]
    if (!first) {
      throw new Error('Expected one candidate')
    }

    expect(first.interestNames).toContain('coding')
    expect(first.interestNames).toContain('hiking')
  })
})
