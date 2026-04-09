import { expect, test } from 'bun:test'
import * as v from 'valibot'
import { UserAdminActionSchema, UserCreateSchema, UserUpdateSchema } from './user'

// --- UserCreateSchema ---
test('UserCreateSchema: valid input', () => {
  const input = {
    email: 'john@student.babcock.edu.ng',
    password: 'Supersecret123',
    role: 'free',
  }
  const result = v.safeParse(UserCreateSchema, input)
  expect(result.success).toBe(true)
})

test('UserCreateSchema: invalid email', () => {
  const input = {
    email: 'john@gmail.com',
    password: 'Supersecret123',
    role: 'free',
  }
  const result = v.safeParse(UserCreateSchema, input)
  expect(result.success).toBe(false)
})

test('UserCreateSchema: short password', () => {
  const input = {
    email: 'john@student.babcock.edu.ng',
    password: 'short',
    role: 'free',
  }
  const result = v.safeParse(UserCreateSchema, input)
  expect(result.success).toBe(false)
})

// --- UserUpdateSchema ---
test('UserUpdateSchema: partial update', () => {
  const input = {
    email: 'jane@babcock.edu.ng',
    is_verified: 1,
    last_login_at: '2026-04-09T09:10:11.000Z',
  }
  const result = v.safeParse(UserUpdateSchema, input)
  expect(result.success).toBe(true)
})

test('UserUpdateSchema: invalid last_login_at', () => {
  const input = {
    last_login_at: 'not-a-timestamp',
  }
  const result = v.safeParse(UserUpdateSchema, input)
  expect(result.success).toBe(false)
})

test('UserUpdateSchema: invalid role', () => {
  const input = {
    role: 'invalid_role',
  }
  const result = v.safeParse(UserUpdateSchema, input)
  expect(result.success).toBe(false)
})

// --- UserAdminActionSchema ---
test('UserAdminActionSchema: ban user', () => {
  const input = {
    is_banned: 1,
  }
  const result = v.safeParse(UserAdminActionSchema, input)
  expect(result.success).toBe(true)
})

test('UserAdminActionSchema: approve user', () => {
  const input = {
    is_approved: 1,
  }
  const result = v.safeParse(UserAdminActionSchema, input)
  expect(result.success).toBe(true)
})
