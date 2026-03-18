import { expect, test } from 'bun:test'
import * as v from 'valibot'
import { MatchCreateSchema, MatchIdSchema } from './match'

// Minimal valid payloads
const validCreate = { user1_id: 1, user2_id: 2 }
const validId = { id: 123 }

test('MatchCreateSchema accepts valid payload', () => {
  const result = v.safeParse(MatchCreateSchema, validCreate)
  expect(result.success).toBe(true)
})

test('MatchCreateSchema rejects missing fields', () => {
  const result = v.safeParse(MatchCreateSchema, { user1_id: 1 })
  expect(result.success).toBe(false)
})

test('MatchIdSchema accepts valid id', () => {
  const result = v.safeParse(MatchIdSchema, validId)
  expect(result.success).toBe(true)
})

test('MatchIdSchema rejects non-numeric id', () => {
  const result = v.safeParse(MatchIdSchema, { id: 'abc' })
  expect(result.success).toBe(false)
})
