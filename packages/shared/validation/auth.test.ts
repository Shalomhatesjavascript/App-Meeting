import { expect, test } from 'bun:test'
import * as v from 'valibot'
import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  VerifySchema,
} from './auth'

// Helper valid email
const validEmail = 'user@student.babcock.edu.ng'
const validStaffEmail = 'admin@babcock.edu.ng'

test('RegisterSchema: valid student email and password', () => {
  const input = {
    email: validEmail,
    password: 'password123',
    confirmPassword: 'password123',
  }
  expect(() => v.parse(RegisterSchema, input)).not.toThrow()
})

test('RegisterSchema: invalid email fails', () => {
  const input = {
    email: 'user@gmail.com',
    password: 'password123',
    confirmPassword: 'password123',
  }
  expect(() => v.parse(RegisterSchema, input)).toThrow()
})

test('LoginSchema: valid staff email', () => {
  const input = {
    email: validStaffEmail,
    password: 'password123',
  }
  expect(() => v.parse(LoginSchema, input)).not.toThrow()
})

test('LoginSchema: short password fails', () => {
  const input = {
    email: validEmail,
    password: '123',
  }
  expect(() => v.parse(LoginSchema, input)).toThrow()
})

test('VerifySchema: valid', () => {
  const input = {
    email: validEmail,
    code: '123456',
  }
  expect(() => v.parse(VerifySchema, input)).not.toThrow()
})

test('ForgotPasswordSchema: valid', () => {
  const input = { email: validStaffEmail }
  expect(() => v.parse(ForgotPasswordSchema, input)).not.toThrow()
})

test('ResetPasswordSchema: valid', () => {
  const input = {
    email: validEmail,
    code: '1234',
    newPassword: 'password123',
    confirmPassword: 'password123',
  }
  expect(() => v.parse(ResetPasswordSchema, input)).not.toThrow()
})

test('ResetPasswordSchema: invalid code fails', () => {
  const input = {
    email: validEmail,
    code: '1',
    newPassword: 'password123',
    confirmPassword: 'password123',
  }
  expect(() => v.parse(ResetPasswordSchema, input)).toThrow()
})
