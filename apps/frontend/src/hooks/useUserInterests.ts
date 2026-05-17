import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import backendApi from '../server/eden-treaty'
import { queryKeys } from './query-keys'

type AddUserInterestArg = Parameters<(typeof backendApi.api)['user-interests']['post']>[0]
type RemoveUserInterestArg = Parameters<(typeof backendApi.api)['user-interests']['delete']>[0]

export function useUserInterestsQuery(userId: string, enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const { data } = await backendApi.api['user-interests']({ id: userId }).get()
      return data
    },
    queryKey: queryKeys.userInterests(userId),
  })
}

export function useAddUserInterestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (arg: AddUserInterestArg) => backendApi.api['user-interests'].post(arg),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.userInterests(variables.userId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile() })
    },
  })
}

export function useRemoveUserInterestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (arg: RemoveUserInterestArg) => backendApi.api['user-interests'].delete(arg),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.userInterests(variables.userId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile() })
    },
  })
}
