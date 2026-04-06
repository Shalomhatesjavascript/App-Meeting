import { beforeEach, describe, expect, it } from 'bun:test'
import {
  asProductionDB,
  createTestDb,
  initializeTestSchema,
  type TestDB,
} from '../../__tests__/setup'
import { createProfile, deleteProfile, getProfileByUserId, updateProfile } from './model'

describe('Profiles Model DB Integration', () => {
  let db: TestDB

  beforeEach(async () => {
    db = createTestDb()
    await initializeTestSchema(db)

    await db.insert((await import('../../db/schema')).usersTable).values({
      email: 'profileuser@student.babcock.edu.ng',
      is_approved: 1,
      is_banned: 0,
      is_verified: 1,
      password_hash: 'hash',
      role: 'free',
    })
  })

  it('creates and reads profile', async () => {
    const created = await createProfile(asProductionDB(db), 1, {
      alias: 'ProfileUser',
      bio: 'Hello',
      department: 'Computer Science',
      full_name: 'Profile User',
      gender: 'male',
      intent: 'friendship',
      is_id_verified: 0,
      level: 200,
    })

    expect(created).toBeDefined()

    const loaded = await getProfileByUserId(asProductionDB(db), 1)
    expect(loaded).toBeDefined()
    expect(loaded?.alias).toBe('ProfileUser')
  })

  it('updates and deletes profile', async () => {
    await createProfile(asProductionDB(db), 1, {
      alias: 'OldAlias',
      bio: 'Hello',
      department: 'Computer Science',
      full_name: 'Profile User',
      gender: 'male',
      intent: 'friendship',
      is_id_verified: 0,
      level: 200,
    })

    const updated = await updateProfile(asProductionDB(db), 1, {
      alias: 'NewAlias',
      bio: 'Updated',
      department: 'Computer Science',
      full_name: 'Profile User',
      gender: 'male',
      intent: 'dating',
      is_id_verified: 1,
      level: 300,
    })

    expect(updated?.alias).toBe('NewAlias')
    expect(updated?.intent).toBe('dating')

    await deleteProfile(asProductionDB(db), 1)
    const loaded = await getProfileByUserId(asProductionDB(db), 1)
    expect(loaded).toBeUndefined()
  })
})
