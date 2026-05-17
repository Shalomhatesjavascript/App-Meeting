import { MinimalEnumBuilder } from 'better-ts-enum/minimal-enum'

export const QueryKeyEnum = MinimalEnumBuilder.new({ valueType: 'key' })
  .$('AdminLogs')
  .$('DiscoveryCandidates')
  .$('DiscoveryPossibleMatches')
  .$('DiscoveryRecommendations')
  .$('Interest')
  .$('Interests')
  .$('InterestsCatalog')
  .$('Like')
  .$('Likes')
  .$('Match')
  .$('Matches')
  .$('Message')
  .$('Messages')
  .$('Subscription')
  .$('Subscriptions')
  .$('Profile')
  .$('Profiles')
  .$('User')
  .$('UserInterest')
  .$('UserInterests')
  .$('Users')
  .build()

export type QueryKeyEnum = typeof QueryKeyEnum.$.infer.values

type AdminLogFilters = Readonly<{
  action?: string
  adminId?: string
  from?: string
  targetUserId?: string
  to?: string
}>

type LikesFilters = Readonly<{
  type?: 'received' | 'sent'
  userId?: string
}>

type UsersListQuery = Readonly<{
  limit?: number
  offset?: number
}>

type UsersSearchQuery = Readonly<{
  limit?: number
  offset?: number
  query: string
}>

export const queryKeys = {
  adminLog: (id: number) => [QueryKeyEnum.AdminLogs, id] as const,
  adminLogs: (filters: AdminLogFilters = {}) =>
    [
      QueryKeyEnum.AdminLogs,
      filters.adminId ?? null,
      filters.action ?? null,
      filters.targetUserId ?? null,
      filters.from ?? null,
      filters.to ?? null,
    ] as const,
  discoveryCandidates: (limit = 50, offset = 0) =>
    [QueryKeyEnum.User, QueryKeyEnum.DiscoveryCandidates, limit, offset] as const,
  discoveryPossibleMatches: (limit = 20, offset = 0, minScore = 100) =>
    [QueryKeyEnum.User, QueryKeyEnum.DiscoveryPossibleMatches, limit, offset, minScore] as const,
  discoveryRecommendations: (limit = 50, offset = 0) =>
    [QueryKeyEnum.User, QueryKeyEnum.DiscoveryRecommendations, limit, offset] as const,
  interest: (id: number) => [QueryKeyEnum.Interest, id] as const,
  interests: () => [QueryKeyEnum.Interests] as const,
  interestsCatalog: () => [QueryKeyEnum.User, QueryKeyEnum.InterestsCatalog] as const,
  like: (id: number) => [QueryKeyEnum.Like, id] as const,
  likes: (filters: LikesFilters = {}) =>
    [QueryKeyEnum.Likes, filters.userId ?? null, filters.type ?? null] as const,
  mutualLikes: (userId?: string) => [QueryKeyEnum.Likes, 'mutual', userId ?? null] as const,
  match: (id: number) => [QueryKeyEnum.Match, id] as const,
  matches: () => [QueryKeyEnum.User, QueryKeyEnum.Matches] as const,
  message: (id: number) => [QueryKeyEnum.Message, id] as const,
  messages: (matchId: number) => [QueryKeyEnum.User, QueryKeyEnum.Messages, matchId] as const,
  profile: () => [QueryKeyEnum.User, QueryKeyEnum.Profile] as const,
  profileByUserId: (userId: string) => [QueryKeyEnum.Profile, userId] as const,
  subscription: (id: number) => [QueryKeyEnum.Subscription, id] as const,
  subscriptions: () => [QueryKeyEnum.Subscriptions] as const,
  user: () => [QueryKeyEnum.User] as const,
  userById: (userId: string) => [QueryKeyEnum.User, userId] as const,
  userInterest: (userId: string) => [QueryKeyEnum.UserInterest, userId] as const,
  userInterests: (userId: string) =>
    [QueryKeyEnum.User, QueryKeyEnum.UserInterests, userId] as const,
  users: (query: UsersListQuery = {}) =>
    [QueryKeyEnum.Users, query.limit ?? null, query.offset ?? null] as const,
  usersSearch: (query: UsersSearchQuery) =>
    [QueryKeyEnum.Users, query.query, query.limit ?? null, query.offset ?? null] as const,
} as const
