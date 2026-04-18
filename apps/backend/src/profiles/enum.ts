import { BasicEnumBuilder } from 'better-ts-enum/basic-enum'

export const ProfileGenderEnum = BasicEnumBuilder.new({ valueType: 'key' })
  .$('Male')
  .$('Female')
  .$('NonBinary')
  .$('RatherNotSay')
  .build()
export type ProfileGenderEnum = typeof ProfileGenderEnum.$.infer.values

export const ProfileIntentEnum = BasicEnumBuilder.new({ valueType: 'key' })
  .$('Dating')
  .$('Friendship')
  .$('Networking')
  .$('Studying')
  .build()
export type ProfileIntentEnum = typeof ProfileIntentEnum.$.infer.values
