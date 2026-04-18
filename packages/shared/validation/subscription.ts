// import * as v from 'valibot'
// import { IsoTimestampSchema, PositiveIntSchema } from './common'

// const IsoDateOrTimestampSchema = v.union([
//   IsoTimestampSchema,
//   v.pipe(v.string(), v.trim(), v.isoDate()),
// ])

// /**
//  * Enum for subscription tiers.
//  */
// export const SubscriptionTierEnum = v.union([
//   v.literal('free'),
//   v.literal('premium'),
//   v.literal('vip'),
// ])
// export type SubscriptionTierEnumInput = v.InferInput<typeof SubscriptionTierEnum>
// export type SubscriptionTierEnumOutput = v.InferOutput<typeof SubscriptionTierEnum>

// /**
//  * Schema for creating a new subscription.
//  */
// export const SubscriptionCreateSchema = v.object({
//   expiry_date: IsoDateOrTimestampSchema,
//   payment_ref: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(100)),
//   start_date: IsoDateOrTimestampSchema,
//   tier: SubscriptionTierEnum,
//   user_id: PositiveIntSchema,
// })
// export type SubscriptionCreateInput = v.InferInput<typeof SubscriptionCreateSchema>
// export type SubscriptionCreateOutput = v.InferOutput<typeof SubscriptionCreateSchema>

// /**
//  * Schema for updating a subscription.
//  * All fields optional except id.
//  */
// export const SubscriptionUpdateSchema = v.object({
//   expiry_date: v.optional(IsoDateOrTimestampSchema),
//   id: PositiveIntSchema,
//   payment_ref: v.optional(v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(100))),
//   start_date: v.optional(IsoDateOrTimestampSchema),
//   tier: v.optional(SubscriptionTierEnum),
// })
// export type SubscriptionUpdateInput = v.InferInput<typeof SubscriptionUpdateSchema>
// export type SubscriptionUpdateOutput = v.InferOutput<typeof SubscriptionUpdateSchema>

// /**
//  * Schema for subscription response (DB row).
//  */
// export const SubscriptionSchema = v.object({
//   expiry_date: IsoDateOrTimestampSchema,
//   id: PositiveIntSchema,
//   payment_ref: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(100)),
//   start_date: IsoDateOrTimestampSchema,
//   tier: SubscriptionTierEnum,
//   user_id: PositiveIntSchema,
// })
// export type SubscriptionInput = v.InferInput<typeof SubscriptionSchema>
// export type SubscriptionOutput = v.InferOutput<typeof SubscriptionSchema>
