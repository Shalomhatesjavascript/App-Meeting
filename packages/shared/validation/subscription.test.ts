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
  user_id: 1,
  tier: 'premium',
  start_date: '2024-01-01T00:00:00.000Z',
  expiry_date: '2024-12-31T23:59:59.000Z',
  payment_ref: 'pay_123456',
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
