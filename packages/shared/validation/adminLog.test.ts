import { describe, expect, it } from 'bun:test'
import * as v from 'valibot'
import { adminLogCreateSchema, adminLogUpdateSchema } from './adminLog'

// Minimal valid payload
const validCreate = {
  admin_id: 1,
  action: 'Banned User',
}

const validUpdate = {
  action: 'Changed user role',
}

describe('adminLogCreateSchema', () => {
  it('accepts a valid payload', () => {
    const result = v.safeParse(adminLogCreateSchema, validCreate)
    expect(result.success).toBe(true)
  })

  it('rejects missing admin_id', () => {
    const result = v.safeParse(adminLogCreateSchema, { action: 'Test' })
    expect(result.success).toBe(false)
  })

  it('rejects action longer than 255 chars', () => {
    const longAction = 'a'.repeat(256)
    const result = v.safeParse(adminLogCreateSchema, {
      admin_id: 1,
      action: longAction,
    })
    expect(result.success).toBe(false)
  })
})

describe('adminLogUpdateSchema', () => {
  it('accepts a valid update payload', () => {
    const result = v.safeParse(adminLogUpdateSchema, validUpdate)
    expect(result.success).toBe(true)
  })

  it('accepts empty object (all fields optional)', () => {
    const result = v.safeParse(adminLogUpdateSchema, {})
    expect(result.success).toBe(true)
  })

  it('rejects action longer than 255 chars', () => {
    const longAction = 'a'.repeat(256)
    const result = v.safeParse(adminLogUpdateSchema, { action: longAction })
    expect(result.success).toBe(false)
  })
})
