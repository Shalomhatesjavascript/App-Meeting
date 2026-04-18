import { beforeEach, describe, expect, it } from 'bun:test'
import { asProductionDB, createTestDb, initializeTestSchema, type TestDB } from '../__tests__/setup'
import { users } from '../utils/auth/schema'
import { ProfileGenderEnum, ProfileIntentEnum } from './enum'
import { createProfile, deleteProfile, getProfileByUserId, updateProfile } from './model'

describe('Profiles Model DB Integration', () => {
  let db: TestDB

  beforeEach(async () => {
    db = createTestDb()
    await initializeTestSchema(db)

    await db.insert(users).values({
      email: 'profileuser@student.babcock.edu.ng',
      id: '1',
      name: 'Profile User',
    })
  })

  it('creates and reads profile', async () => {
    const created = await createProfile(asProductionDB(db), '1', {
      alias: 'ProfileUser',
      bio: 'Hello',
      department: 'Computer Science',
      fullName: 'Profile User',
      gender: ProfileGenderEnum.Male,
      intent: ProfileIntentEnum.Dating,
      isIdVerified: true,
      level: 200,
    })

    expect(created).toBeDefined()

    const loaded = await getProfileByUserId(asProductionDB(db), '1')
    expect(loaded).toBeDefined()
    expect(loaded?.alias).toBe('ProfileUser')
  })

  it('updates and deletes profile', async () => {
    await createProfile(asProductionDB(db), '1', {
      alias: 'ProfileUser',
      bio: 'Hello',
      department: 'Computer Science',
      fullName: 'Profile User',
      gender: ProfileGenderEnum.Male,
      intent: ProfileIntentEnum.Dating,
      isIdVerified: true,
      level: 200,
    })

    const updated = await updateProfile(asProductionDB(db), '1', {
      alias: 'NewAlias',
      bio: 'Updated',
      department: 'Computer Science',
      fullName: 'Profile User',
      gender: ProfileGenderEnum.Male,
      intent: ProfileIntentEnum.Dating,
      isIdVerified: true,
      level: 300,
    })

    expect(updated?.alias).toBe('NewAlias')
    expect(updated?.intent).toBe(ProfileIntentEnum.Dating)

    await deleteProfile(asProductionDB(db), '1')
    const loaded = await getProfileByUserId(asProductionDB(db), '1')
    expect(loaded).toBeUndefined()
  })
})
