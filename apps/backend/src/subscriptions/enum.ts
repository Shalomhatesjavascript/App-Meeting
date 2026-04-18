import { BasicEnumBuilder } from 'better-ts-enum/basic-enum'

export const SubscriptionTierEnum = BasicEnumBuilder.new({ valueType: 'key' })
  .$('Free')
  .$('Premium')
  .$('Vip')
  .build()

export type SubscriptionTierEnum = typeof SubscriptionTierEnum.$.infer.values
