import { BasicEnumBuilder } from 'better-ts-enum/basic-enum'

export const WeekyMatchLimitEnum = BasicEnumBuilder.new()
  .$('Free', 3)
  .$('Premium', 7)
  .$('Vip', 15)
  .build()
export type WeeklyLimitEnum = typeof WeekyMatchLimitEnum.$.infer.values
