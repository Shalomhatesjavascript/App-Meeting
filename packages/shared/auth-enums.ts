import { BasicEnumBuilder } from 'better-ts-enum/basic-enum'
import * as v from 'valibot'

export const AuthErrorCodeEnum = BasicEnumBuilder.new({ valueType: 'key' })
  .$('AuthenticationRequired')
  .$('Forbidden')
  .$('ValidationError')
  .$('NotFound')
  .$('Conflict')
  .$('InternalError')
  .build()

export type AuthErrorCode = typeof AuthErrorCodeEnum.$.infer.values

export const AuthRoleEnum = BasicEnumBuilder.new({ valueType: 'key' })
  .$('free')
  .$('admin')
  .$('premium')
  .$('vip')
  .build()

export type AuthRole = typeof AuthRoleEnum.$.infer.values
export const AuthRoleSchema = v.enum(AuthRoleEnum.$.raw)
