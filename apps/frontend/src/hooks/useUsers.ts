import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import backendApi from '../server/eden-treaty'
import type { ExtractFirstFunctionParamter } from '../shared/util'
import { queryKeys } from './query-keys'

type UsersListQuery = Readonly<{
  limit?: number
  offset?: number
}>

type UsersSearchQuery = Readonly<{
  limit?: number
  offset?: number
  query: string
}>

export function useUsersQuery({ limit = 50, offset = 0 }: UsersListQuery = {}) {
  return useQuery({
    queryFn: async () => {
      const { data } = await backendApi.api.users.get({ query: { limit, offset } })
      return data
    },
    queryKey: queryKeys.users({ limit, offset }),
  })
}

export function useUserSearchQuery(
  { limit = 20, offset = 0, query }: UsersSearchQuery,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const { data } = await backendApi.api.users.search.get({ query: { limit, offset, query } })
      return data
    },
    queryKey: queryKeys.usersSearch({ limit, offset, query }),
  })
}

export function useUserDetailsQuery(userId: string, enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const { data } = await backendApi.api.users({ id: userId }).get()
      return data
    },
    queryKey: queryKeys.userById(userId),
  })
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (arg: ExtractFirstFunctionParamter<typeof backendApi.api.users.post>) =>
      backendApi.api.users.post(arg),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users() })
    },
  })
}

export function useUpdateUserMutation(userId: string) {
  const queryClient = useQueryClient()
  const userRoute = backendApi.api.users({ id: userId })

  return useMutation({
    mutationFn: (arg: ExtractFirstFunctionParamter<typeof userRoute.patch>) => userRoute.patch(arg),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.userById(userId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.user() })
    },
  })
}

export function useDeleteUserMutation(userId: string) {
  const queryClient = useQueryClient()
  const userRoute = backendApi.api.users({ id: userId })

  return useMutation({
    mutationFn: () => userRoute.delete(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.userById(userId) })
    },
  })
}

export function useBanUserMutation(userId: string) {
  const queryClient = useQueryClient()
  const userRoute = backendApi.api.users({ id: userId })

  return useMutation({
    mutationFn: (shouldBan: boolean = true) => userRoute.ban.post({}, { query: { shouldBan } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.userById(userId) })
    },
  })
}

export function useApproveUserMutation(userId: string) {
  const queryClient = useQueryClient()
  const userRoute = backendApi.api.users({ id: userId })

  return useMutation({
    mutationFn: () => userRoute.approve.post(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.userById(userId) })
    },
  })
}

export function useUserStatsQuery(userId: string, enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const { data } = await backendApi.api.users({ id: userId }).stats.get()
      return data
    },
    queryKey: [queryKeys.userById(userId), 'stats'] as const,
  })
}
