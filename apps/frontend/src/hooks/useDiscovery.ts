import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import backendApi from '../server/eden-treaty'
import type { ExtractFirstFunctionParamter } from '../shared/util'
import { queryKeys } from './query-keys'

type DiscoveryQueryParams = Readonly<{
  limit?: number
  offset?: number
}>

export function useDiscoveryCandidatesQuery({ limit = 50, offset = 0 }: DiscoveryQueryParams = {}) {
  return useQuery({
    queryFn: async () => {
      const { data } = await backendApi.api.discovery.candidates.get({ query: { limit, offset } })
      return data
    },
    queryKey: queryKeys.discoveryCandidates(limit, offset),
  })
}

export function useDiscoveryRecommendationsQuery({
  limit = 50,
  offset = 0,
}: DiscoveryQueryParams = {}) {
  return useQuery({
    queryFn: () => backendApi.api.discovery.recommendations.get({ query: { limit, offset } }),
    queryKey: queryKeys.discoveryRecommendations(limit, offset),
  })
}

type PossibleMatchesQueryParams = DiscoveryQueryParams & Readonly<{ minScore?: number }>

export function usePossibleMatchesQuery({
  limit = 20,
  offset = 0,
  minScore = 100,
}: PossibleMatchesQueryParams = {}) {
  return useQuery({
    queryFn: () =>
      backendApi.api.discovery['possible-matches'].get({ query: { limit, offset, minScore } }),
    queryKey: queryKeys.discoveryPossibleMatches(limit, offset, minScore),
  })
}

export function useSwipeUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (arg: ExtractFirstFunctionParamter<typeof backendApi.api.likes.post>) => {
      const { data } = await backendApi.api.likes.post(arg)
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.discoveryCandidates() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.discoveryPossibleMatches() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.discoveryRecommendations() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.likes() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.matches() })
    },
  })
}
