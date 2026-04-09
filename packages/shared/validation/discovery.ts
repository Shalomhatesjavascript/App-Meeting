import * as v from 'valibot'
import { NonNegativeIntSchema, PositiveIntSchema } from './common'

/**
 * Schema for discovery query parameters.
 * Clamping is done at the route level, not in the schema.
 * - limit: optional, positive integer
 * - offset: optional, non-negative integer
 */
export const DiscoveryRecommendationsQuerySchema = v.object({
  limit: v.optional(PositiveIntSchema),
  offset: v.optional(NonNegativeIntSchema),
})
export type DiscoveryRecommendationsQueryInput = v.InferInput<
  typeof DiscoveryRecommendationsQuerySchema
>
export type DiscoveryRecommendationsQueryOutput = v.InferOutput<
  typeof DiscoveryRecommendationsQuerySchema
>

/**
 * Schema for possible matches query parameters.
 * Clamping is done at the route level, not in the schema.
 * - limit: optional, positive integer
 * - offset: optional, non-negative integer
 * - minScore: optional, non-negative integer
 */
export const DiscoveryPossibleMatchesQuerySchema = v.object({
  limit: v.optional(PositiveIntSchema),
  minScore: v.optional(NonNegativeIntSchema),
  offset: v.optional(NonNegativeIntSchema),
})
export type DiscoveryPossibleMatchesQueryInput = v.InferInput<
  typeof DiscoveryPossibleMatchesQuerySchema
>
export type DiscoveryPossibleMatchesQueryOutput = v.InferOutput<
  typeof DiscoveryPossibleMatchesQuerySchema
>

/**
 * Schema for candidates query parameters (legacy).
 * Clamping is done at the route level, not in the schema.
 * - limit: optional, positive integer
 * - offset: optional, non-negative integer
 */
export const DiscoveryCandidatesQuerySchema = v.object({
  limit: v.optional(PositiveIntSchema),
  offset: v.optional(NonNegativeIntSchema),
})
export type DiscoveryCandidatesQueryInput = v.InferInput<typeof DiscoveryCandidatesQuerySchema>
export type DiscoveryCandidatesQueryOutput = v.InferOutput<typeof DiscoveryCandidatesQuerySchema>
