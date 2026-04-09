import { expect, test } from 'bun:test'
import * as v from 'valibot'
import {
  SubscriptionCreateSchema,
  SubscriptionSchema,
  SubscriptionTierEnum,
  SubscriptionUpdateSchema,
} from './subscription'

// Helper valid data
const validCreate = {
  expiry_date: '2024-12-31T23:59:59.000Z',
  payment_ref: 'pay_123456',
  start_date: '2024-01-01T00:00:00.000Z',
  tier: 'premium',
  user_id: 1,
}

test('SubscriptionCreateSchema: valid input passes', () => {
  const result = v.safeParse(SubscriptionCreateSchema, validCreate)
  expect(result.success).toBe(true)
})

test('SubscriptionCreateSchema: invalid tier fails', () => {
  const result = v.safeParse(SubscriptionCreateSchema, {
    ...validCreate,
    tier: 'gold',
  })
  expect(result.success).toBe(false)
})

test('SubscriptionUpdateSchema: partial update passes', () => {
  const result = v.safeParse(SubscriptionUpdateSchema, {
    id: 1,
    tier: 'vip',
  })
  expect(result.success).toBe(true)
})

test('SubscriptionSchema: valid db row passes', () => {
  const result = v.safeParse(SubscriptionSchema, {
    id: 1,
    ...validCreate,
  })
  expect(result.success).toBe(true)
})

test('SubscriptionTierEnum: only allows allowed values', () => {
  expect(v.safeParse(SubscriptionTierEnum, 'free').success).toBe(true)
  expect(v.safeParse(SubscriptionTierEnum, 'premium').success).toBe(true)
  expect(v.safeParse(SubscriptionTierEnum, 'vip').success).toBe(true)
  expect(v.safeParse(SubscriptionTierEnum, 'other').success).toBe(false)
})

test('SubscriptionCreateSchema: rejects invalid timestamp', () => {
  const result = v.safeParse(SubscriptionCreateSchema, {
    ...validCreate,
    start_date: 'not-a-timestamp',
  })
  expect(result.success).toBe(false)
})

test('SubscriptionCreateSchema: rejects non-positive user_id', () => {
  const result = v.safeParse(SubscriptionCreateSchema, {
    ...validCreate,
    user_id: 0,
  })
  expect(result.success).toBe(false)
})
