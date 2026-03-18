import { describe, expect, it } from 'bun:test'
import * as v from 'valibot'
import { AdminLogCreateSchema, AdminLogUpdateSchema } from './adminLog'

// Minimal valid payload
const validCreate = {
  action: 'Banned User',
  admin_id: 1,
}

const validUpdate = {
  action: 'Changed user role',
}

describe('AdminLogCreateSchema', () => {
  it('accepts a valid payload', () => {
    const result = v.safeParse(AdminLogCreateSchema, validCreate)
    expect(result.success).toBe(true)
  })

  it('rejects missing admin_id', () => {
    const result = v.safeParse(AdminLogCreateSchema, { action: 'Test' })
    expect(result.success).toBe(false)
  })

  it('rejects action longer than 255 chars', () => {
    const longAction = 'a'.repeat(256)
    const result = v.safeParse(AdminLogCreateSchema, {
      action: longAction,
      admin_id: 1,
    })
    expect(result.success).toBe(false)
  })
})

describe('AdminLogUpdateSchema', () => {
  it('accepts a valid update payload', () => {
    const result = v.safeParse(AdminLogUpdateSchema, validUpdate)
    expect(result.success).toBe(true)
  })

  it('accepts empty object (all fields optional)', () => {
    const result = v.safeParse(AdminLogUpdateSchema, {})
    expect(result.success).toBe(true)
  })

  it('rejects action longer than 255 chars', () => {
    const longAction = 'a'.repeat(256)
    const result = v.safeParse(AdminLogUpdateSchema, { action: longAction })
    expect(result.success).toBe(false)
  })
})
