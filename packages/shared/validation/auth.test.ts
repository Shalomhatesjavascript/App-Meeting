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
    confirmPassword: 'Password123',
    email: validEmail,
    name: 'John Doe',
    password: 'Password123',
  }
  expect(() => v.parse(RegisterSchema, input)).not.toThrow()
})

test('RegisterSchema: invalid email fails', () => {
  const input = {
    confirmPassword: 'Password123',
    email: 'user@gmail.com',
    name: 'John Doe',
    password: 'Password123',
  }
  expect(() => v.parse(RegisterSchema, input)).toThrow()
})

test('RegisterSchema: weak password fails', () => {
  const input = {
    confirmPassword: 'password123',
    email: validEmail,
    name: 'John Doe',
    password: 'password123',
  }
  expect(() => v.parse(RegisterSchema, input)).toThrow()
})

test('LoginSchema: valid staff email', () => {
  const input = {
    email: validStaffEmail,
    password: 'Password123',
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
    code: '123456',
    email: validEmail,
  }
  expect(() => v.parse(VerifySchema, input)).not.toThrow()
})

test('ForgotPasswordSchema: valid', () => {
  const input = { email: validStaffEmail }
  expect(() => v.parse(ForgotPasswordSchema, input)).not.toThrow()
})

test('ResetPasswordSchema: valid', () => {
  const input = {
    code: '1234',
    confirmPassword: 'Password123',
    email: validEmail,
    newPassword: 'Password123',
  }
  expect(() => v.parse(ResetPasswordSchema, input)).not.toThrow()
})

test('ResetPasswordSchema: invalid code fails', () => {
  const input = {
    code: '1',
    confirmPassword: 'Password123',
    email: validEmail,
    newPassword: 'Password123',
  }
  expect(() => v.parse(ResetPasswordSchema, input)).toThrow()
})
