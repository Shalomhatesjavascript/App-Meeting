import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import backendApi from '../server/eden-treaty'
import type { ExtractFirstFunctionParamter } from '../shared/util'
import { queryKeys } from './query-keys'
import { getInterestsCatalog } from '../shared/catalog'

export function useInterestsQuery() {
  return useQuery({
    queryFn: async () => {
      // TODO: store the interests in the backend rather than using a fallback
      const { data } = await backendApi.api.interests.get()

      if (!data?.length)
        return (await getInterestsCatalog()).map((interest) => ({
          name: interest,
          id: Math.random() * 100000,
        }))

      return data
    },
    queryKey: queryKeys.interests(),
  })
}

export function useInterestQuery(id: number, enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const { data } = await backendApi.api.interests({ id }).get()
      return data
    },
    queryKey: queryKeys.interest(id),
  })
}

export function useCreateInterestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (arg: ExtractFirstFunctionParamter<typeof backendApi.api.interests.post>) =>
      backendApi.api.interests.post(arg),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.interests() })
    },
  })
}

export function useUpdateInterestMutation(id: number) {
  const queryClient = useQueryClient()
  const interestRoute = backendApi.api.interests({ id })

  return useMutation({
    mutationFn: (arg: ExtractFirstFunctionParamter<typeof interestRoute.put>) =>
      interestRoute.put(arg),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.interests() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.interest(id) })
    },
  })
}

export function useDeleteInterestMutation(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => backendApi.api.interests({ id }).delete(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.interests() })
    },
  })
}
