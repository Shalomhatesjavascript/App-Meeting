import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import backendApi from '../server/eden-treaty'
import type { ExtractFirstFunctionParamter } from '../shared/util'
import { queryKeys } from './query-keys'

type LikesQuery = Readonly<{
  type?: 'received' | 'sent'
  userId?: string
}>

export function useLikesQuery(filters: LikesQuery = {}) {
  return useQuery({
    queryFn: async () => {
      const query: Record<string, string> = {}

      if (filters.userId) query.id = filters.userId
      if (filters.type) query.type = filters.type

      const { data } = await backendApi.api.likes.get({ query })
      return data
    },
    queryKey: queryKeys.likes(filters),
  })
}

export function useMutualLikesQuery(userId?: string, enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const query = userId ? { id: userId } : {}
      const { data } = await backendApi.api.likes.mutual.get({ query })
      return data
    },
    queryKey: queryKeys.mutualLikes(userId),
  })
}

export function useLikeQuery(id: number, enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const { data } = await backendApi.api.likes({ id }).get()
      return data
    },
    queryKey: queryKeys.like(id),
  })
}

export function useCreateLikeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (arg: ExtractFirstFunctionParamter<typeof backendApi.api.likes.post>) =>
      backendApi.api.likes.post(arg),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.matches() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.likes() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.discoveryCandidates() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.discoveryPossibleMatches() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.discoveryRecommendations() })
    },
  })
}
