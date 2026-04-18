import { BasicEnumBuilder } from 'better-ts-enum/basic-enum'

export const ApiRoutePrefixEnum = BasicEnumBuilder.new({ prefix: '/api/' })
  .$('AdminLogs', 'admin-logs')
  .$('BetterAuth', 'better-auth')
  .$('Subscriptions', 'subscriptions')
  .$('Users', 'users')
  .$('UserInterests', 'user-interests')
  .$('Likes', 'likes')
  .$('Interests', 'interests')
  .$('Messages', 'messages')
  .$('Matches', 'matches')
  .$('Profiles', 'profiles')
  .$('Discovery', 'discovery')
  .build()
export type ApiRoutePrefixEnum = typeof ApiRoutePrefixEnum.$.infer.values
