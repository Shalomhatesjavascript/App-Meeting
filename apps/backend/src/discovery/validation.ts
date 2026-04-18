import * as v from 'valibot'

const PositiveIntSchema = v.pipe(
  v.unknown(),
  v.toNumber(),
  v.finite(),
  v.integer(),
  v.safeInteger(),
  v.minValue(1),
)

const NonNegativeIntSchema = v.pipe(
  v.unknown(),
  v.toNumber(),
  v.finite(),
  v.integer(),
  v.safeInteger(),
  v.minValue(0),
)

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

export const DiscoveryCandidatesQuerySchema = v.object({
  limit: v.optional(PositiveIntSchema),
  offset: v.optional(NonNegativeIntSchema),
})
export type DiscoveryCandidatesQueryInput = v.InferInput<typeof DiscoveryCandidatesQuerySchema>
export type DiscoveryCandidatesQueryOutput = v.InferOutput<typeof DiscoveryCandidatesQuerySchema>
