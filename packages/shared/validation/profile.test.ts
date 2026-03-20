import { expect, test } from 'bun:test'
import * as v from 'valibot'
import { ProfileCreateSchema, ProfileUpdateSchema } from './profile'

// Minimal valid payload for creation
const validCreate = {
  full_name: 'John Doe',
  alias: 'johnd',
  gender: 'male',
  department: 'Computer Science',
  level: 300,
  bio: 'Just a test user.',
  intent: 'friendship',
  is_id_verified: 1,
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
