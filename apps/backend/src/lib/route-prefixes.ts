import { BasicEnumBuilder } from 'better-ts-enum/basic-enum'

export const ApiRoutePrefix = BasicEnumBuilder.new({ valueType: 'key' })
  .$('admin-logs')
  .$('auth')
  .$('subscriptions')
  .$('users')
  .$('user-interests')
  .$('likes')
  .$('interests')
  .$('messages')
  .$('matches')
  .$('profiles')
  .build()
export type ApiRoutePrefix = typeof ApiRoutePrefix.$.infer.values

export function getApiRoutePrefixUrl<const TPrefix extends ApiRoutePrefix>(
  prefix: TPrefix,
): `/${TPrefix}` {
  return `/${prefix}`
}
