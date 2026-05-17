import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import backendApi from '../server/eden-treaty'
import type { ExtractFirstFunctionParamter } from '../shared/util'
import { queryKeys } from './query-keys'

export function useSubscriptionsQuery() {
  return useQuery({
    queryFn: async () => {
      const { data } = await backendApi.api.subscriptions.get()
      return data
    },
    queryKey: queryKeys.subscriptions(),
  })
}

export function useMySubscriptionQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const { data } = await backendApi.api.subscriptions.me.get()
      return data
    },
    queryKey: [queryKeys.subscriptions(), 'me'] as const,
  })
}

export function useSubscriptionQuery(id: number, enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const { data } = await backendApi.api.subscriptions({ id }).get()
      return data
    },
    queryKey: queryKeys.subscription(id),
  })
}

export function useCreateSubscriptionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (arg: ExtractFirstFunctionParamter<typeof backendApi.api.subscriptions.post>) =>
      backendApi.api.subscriptions.post(arg),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions() })
    },
  })
}

export function useUpdateSubscriptionMutation(id: number) {
  const queryClient = useQueryClient()
  const subscriptionRoute = backendApi.api.subscriptions({ id })

  return useMutation({
    mutationFn: (arg: ExtractFirstFunctionParamter<typeof subscriptionRoute.patch>) =>
      subscriptionRoute.patch(arg),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.subscription(id) })
    },
  })
}

export function useDeleteSubscriptionMutation(id: number) {
  const queryClient = useQueryClient()
  const subscriptionRoute = backendApi.api.subscriptions({ id })

  return useMutation({
    mutationFn: () => subscriptionRoute.delete(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.subscription(id) })
    },
  })
}
