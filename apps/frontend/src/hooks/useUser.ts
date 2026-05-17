import type { ProfileSelectDB, UserWithMetaSelectDB } from '@repo/backend'
import { useQuery } from '@tanstack/react-query'
import { authClient } from '../lib/auth-client'
import backendApi from '../server/eden-treaty'
import { queryKeys } from './query-keys'

export type CurrentUserQueryResult = Readonly<{
  createdAt: UserWithMetaSelectDB['user']['createdAt']
  email: UserWithMetaSelectDB['user']['email']
  id: UserWithMetaSelectDB['user']['id']
  image: UserWithMetaSelectDB['user']['image']
  isPremium: boolean
  isVerified: UserWithMetaSelectDB['meta']['isVerified']
  name: UserWithMetaSelectDB['user']['name']
  profile: ProfileSelectDB | null
  profileComplete: boolean
  updatedAt: UserWithMetaSelectDB['user']['updatedAt']
}>

export function useUserQuery() {
  return useQuery({
    queryKey: queryKeys.user(),
    queryFn: async () => {
      const session = await authClient.getSession()
      const userId = session.data?.user.id

      if (!userId) return null

      const [userResponse, profileResponse] = await Promise.all([
        backendApi.api.users({ id: userId }).get(),
        backendApi.api.profiles.me.get().catch(() => ({ data: null })),
      ])

      const userData = userResponse.data

      if (!userData) return null

      const profile = profileResponse.data

      return {
        ...userData.user,
        createdAt: userData.user.createdAt,
        email: userData.user.email,
        id: userData.user.id,
        image: userData.user.image ?? null,
        isPremium: userData.meta.role === 'Premium' || userData.meta.role === 'Vip',
        isVerified: userData.meta.isVerified,
        name: userData.user.name,
        profile,
        profileComplete: profile?.isComplete ?? false,
        updatedAt: userData.user.updatedAt,
      } satisfies CurrentUserQueryResult
    },
  })
}

export function useUserByIdQuery(userId: string, enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const { data } = await backendApi.api.users({ id: userId }).get()
      return data
    },
    queryKey: queryKeys.userById(userId),
  })
}
