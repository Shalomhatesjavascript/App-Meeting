import { BasicEnumBuilder } from 'better-ts-enum/basic-enum'

export const UserMetaRoleEnum = BasicEnumBuilder.new({ valueType: 'key' })
  .$('Free')
  .$('Admin')
  .$('Premium')
  .$('Vip')
  .build()
export type UserMetaRoleEnum = typeof UserMetaRoleEnum.$.infer.values
