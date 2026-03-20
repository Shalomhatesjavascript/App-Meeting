import { expect, test } from 'bun:test'
import * as v from 'valibot'
import { LikeCreateSchema, LikeIdSchema } from './like'

// Minimal valid like payload
const validLike = {
  from_user_id: 1,
  to_user_id: 2,
  is_like: true,
}

const invalidLike = {
  from_user_id: 'not-a-number',
  to_user_id: 2,
  is_like: 'yes',
}

test('LikeCreateSchema: accepts valid like', () => {
  const result = v.safeParse(LikeCreateSchema, validLike)
  expect(result.success).toBe(true)
})

test('LikeCreateSchema: rejects invalid like', () => {
  const result = v.safeParse(LikeCreateSchema, invalidLike)
  expect(result.success).toBe(false)
})

test('LikeIdSchema: accepts valid id', () => {
  const result = v.safeParse(LikeIdSchema, { id: 123 })
  expect(result.success).toBe(true)
})

test('LikeIdSchema: rejects missing id', () => {
  const result = v.safeParse(LikeIdSchema, {})
  expect(result.success).toBe(false)
})
