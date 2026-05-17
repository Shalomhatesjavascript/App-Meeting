import type { ProfileInsertDB, ProfileSelectDB, ProfileUpdateDB } from '@repo/backend'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import backendApi from '../server/eden-treaty'
import { QueryKeyEnum } from './query-keys'

export function useProfileQuery() {
  return useQuery({
    queryFn: async () => {
      const { data } = await backendApi.api.profiles.me.get()
      return data as ProfileSelectDB | null
    },
    queryKey: [QueryKeyEnum.User, QueryKeyEnum.Profile],
  })
}

type ProfileMutationResult = Readonly<{ profile: ProfileSelectDB | null }>

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: ProfileUpdateDB): Promise<ProfileMutationResult> => {
      const { data } = await backendApi.api.profiles.put(updates)
      return { profile: data as ProfileSelectDB | null }
    },
    onSuccess: ({ profile }) => {
      if (profile) queryClient.setQueryData([QueryKeyEnum.Profile], profile)

      void queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.Matches] })
      void queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.DiscoveryCandidates] })
    },
  })
}

export function useSaveProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ProfileInsertDB): Promise<ProfileMutationResult> => {
      const { data } = await backendApi.api.profiles.post(payload)
      return { profile: data as ProfileSelectDB | null }
    },
    onSuccess: ({ profile }) => {
      if (profile) queryClient.setQueryData([QueryKeyEnum.Profile], profile)

      void queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.Matches] })
      void queryClient.invalidateQueries({ queryKey: [QueryKeyEnum.DiscoveryCandidates] })
    },
  })
}
