import type { ProfileInsertDB, ProfileSelectDB, ProfileUpdateDB } from '@repo/backend'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import backendApi from '../server/eden-treaty'
import { queryKeys } from './query-keys'
import type { CurrentUserQueryResult } from './useUser'

export function useProfileQuery() {
  return useQuery({
    queryFn: async () => {
      const { data } = await backendApi.api.profiles.me.get()
      return data as ProfileSelectDB | null
    },
    queryKey: queryKeys.profile(),
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
      if (profile) {
        queryClient.setQueryData(queryKeys.profile(), profile)
        queryClient.setQueryData(
          queryKeys.user(),
          (existing: CurrentUserQueryResult | null | undefined) =>
            existing
              ? {
                  ...existing,
                  profile,
                  profileComplete: profile.isComplete ?? false,
                }
              : existing,
        )
      }

      void queryClient.invalidateQueries({ queryKey: queryKeys.matches() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.discoveryCandidates() })
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
      if (profile) {
        queryClient.setQueryData(queryKeys.profile(), profile)
        queryClient.setQueryData(
          queryKeys.user(),
          (existing: CurrentUserQueryResult | null | undefined) =>
            existing
              ? {
                  ...existing,
                  profile,
                  profileComplete: profile.isComplete ?? false,
                }
              : existing,
        )
      }

      void queryClient.invalidateQueries({ queryKey: queryKeys.matches() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.discoveryCandidates() })
    },
  })
}
