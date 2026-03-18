import * as v from 'valibot'

/**
 * Enum for subscription tiers.
 */
export const SubscriptionTierEnum = v.union([
  v.literal('free'),
  v.literal('premium'),
  v.literal('vip'),
])
export type SubscriptionTierEnumInput = v.InferInput<typeof SubscriptionTierEnum>
export type SubscriptionTierEnumOutput = v.InferOutput<typeof SubscriptionTierEnum>

/**
 * Schema for creating a new subscription.
 */
export const SubscriptionCreateSchema = v.object({
  user_id: v.number(),
  tier: SubscriptionTierEnum,
  start_date: v.string(),
  expiry_date: v.string(),
  payment_ref: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
})
export type SubscriptionCreateInput = v.InferInput<typeof SubscriptionCreateSchema>
export type SubscriptionCreateOutput = v.InferOutput<typeof SubscriptionCreateSchema>

/**
 * Schema for updating a subscription.
 * All fields optional except id.
 */
export const SubscriptionUpdateSchema = v.object({
  id: v.number(),
  tier: v.optional(SubscriptionTierEnum),
  start_date: v.optional(v.string()),
  expiry_date: v.optional(v.string()),
  payment_ref: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(100))),
})
export type SubscriptionUpdateInput = v.InferInput<typeof SubscriptionUpdateSchema>
export type SubscriptionUpdateOutput = v.InferOutput<typeof SubscriptionUpdateSchema>

/**
 * Schema for subscription response (DB row).
 */
export const SubscriptionSchema = v.object({
  id: v.number(),
  user_id: v.number(),
  tier: SubscriptionTierEnum,
  start_date: v.string(),
  expiry_date: v.string(),
  payment_ref: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
})
export type SubscriptionInput = v.InferInput<typeof SubscriptionSchema>
export type SubscriptionOutput = v.InferOutput<typeof SubscriptionSchema>
