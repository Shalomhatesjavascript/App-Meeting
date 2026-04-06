import { BasicEnumBuilder } from 'better-ts-enum/basic-enum'
import * as v from 'valibot'

export const AuthRoleEnum = BasicEnumBuilder.new({ valueType: 'key' })
  .$('free')
  .$('premium')
  .$('admin')
  .build()
export type AuthRole = typeof AuthRoleEnum.$.infer.values

export const AuthRoleValues = [AuthRoleEnum.free, AuthRoleEnum.premium, AuthRoleEnum.admin] as const
export const AuthRoleSchema = v.picklist(AuthRoleValues)

export const AuthErrorCodeEnum = BasicEnumBuilder.new({ valueType: 'key' })
  .$('AUTHENTICATION_REQUIRED')
  .$('FORBIDDEN')
  .$('VALIDATION_ERROR')
  .$('NOT_FOUND')
  .$('CONFLICT')
  .$('INTERNAL_ERROR')
  .build()
export type AuthErrorCode = typeof AuthErrorCodeEnum.$.infer.values
