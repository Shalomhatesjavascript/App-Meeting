import { expect, test } from 'bun:test'
import * as v from 'valibot'
import { MessageCreateSchema, MessageQuerySchema, MessageReadSchema } from './message'

// Minimal valid payloads
const validCreate = {
  match_id: 1,
  sender_id: 2,
  content: 'Hello world!',
}

const validRead = {
  id: 1,
}

const validQuery = {
  match_id: 1,
  before_id: 10,
  limit: 20,
}

test('MessageCreateSchema: accepts valid payload', () => {
  const result = v.safeParse(MessageCreateSchema, validCreate)
  expect(result.success).toBe(true)
})

test('MessageCreateSchema: rejects missing content', () => {
  const result = v.safeParse(MessageCreateSchema, {
    match_id: 1,
    sender_id: 2,
  })
  expect(result.success).toBe(false)
})

test('MessageReadSchema: accepts valid payload', () => {
  const result = v.safeParse(MessageReadSchema, validRead)
  expect(result.success).toBe(true)
})

test('MessageReadSchema: rejects missing id', () => {
  const result = v.safeParse(MessageReadSchema, {})
  expect(result.success).toBe(false)
})

test('MessageQuerySchema: accepts valid payload', () => {
  const result = v.safeParse(MessageQuerySchema, validQuery)
  expect(result.success).toBe(true)
})

test('MessageQuerySchema: accepts minimal payload', () => {
  const result = v.safeParse(MessageQuerySchema, { match_id: 1 })
  expect(result.success).toBe(true)
})
