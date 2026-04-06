import * as v from 'valibot'

/**
 * Schema for discovery query parameters.
 * Clamping is done at the route level, not in the schema.
 * - limit: optional, positive integer
 * - offset: optional, non-negative integer
 */
export const DiscoveryRecommendationsQuerySchema = v.object({
  limit: v.optional(v.pipe(v.number(), v.minValue(1))),
  offset: v.optional(v.pipe(v.number(), v.minValue(0))),
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
  limit: v.optional(v.pipe(v.number(), v.minValue(1))),
  minScore: v.optional(v.pipe(v.number(), v.minValue(0))),
  offset: v.optional(v.pipe(v.number(), v.minValue(0))),
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
  limit: v.optional(v.pipe(v.number(), v.minValue(1))),
  offset: v.optional(v.pipe(v.number(), v.minValue(0))),
})
export type DiscoveryCandidatesQueryInput = v.InferInput<typeof DiscoveryCandidatesQuerySchema>
export type DiscoveryCandidatesQueryOutput = v.InferOutput<typeof DiscoveryCandidatesQuerySchema>
