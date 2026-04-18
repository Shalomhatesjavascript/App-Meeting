import { expect, test } from 'bun:test'
import * as v from 'valibot'
import { ProfileCreateSchema, ProfileUpdateSchema } from './profile'

// Minimal valid payload for creation
const validCreate = {
  avatarSeed: 'felix',
  avatarStyle: 'notionists',
  alias: 'johnd',
  bio: 'Just a test user.',
  department: 'Computer Science',
  fullName: 'John Doe',
  gender: 'male',
  intent: 'friendship',
  isIdVerified: true,
  level: 300,
}

test('ProfileCreateSchema accepts valid payload', () => {
  const result = v.safeParse(ProfileCreateSchema, validCreate)
  expect(result.success).toBe(true)
})

test('ProfileCreateSchema rejects missing required fields', () => {
  const result = v.safeParse(ProfileCreateSchema, {})
  expect(result.success).toBe(false)
})

test('ProfileUpdateSchema accepts partial update', () => {
  const result = v.safeParse(ProfileUpdateSchema, { bio: 'Updated bio' })
  expect(result.success).toBe(true)
})

test('ProfileUpdateSchema rejects invalid types', () => {
  const result = v.safeParse(ProfileUpdateSchema, { level: 'not-a-number' })
  expect(result.success).toBe(false)
})

test('ProfileCreateSchema rejects invalid level range', () => {
  const result = v.safeParse(ProfileCreateSchema, { ...validCreate, level: 50 })
  expect(result.success).toBe(false)
})

test('ProfileCreateSchema rejects invalid id verification value', () => {
  const result = v.safeParse(ProfileCreateSchema, { ...validCreate, isIdVerified: 2 })
  expect(result.success).toBe(false)
})
