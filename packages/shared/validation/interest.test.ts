import { describe, expect, it } from 'bun:test'
import * as v from 'valibot'
import { InterestCreateSchema, InterestUpdateSchema } from './interest'

// Minimal valid and invalid payloads
const validCreate = { name: 'Music' }
const invalidCreate = { name: '' }

const validUpdate = { id: 1, name: 'Coding' }
const invalidUpdate = { id: 1, name: '' }

describe('InterestCreateSchema', () => {
  it('accepts a valid interest', () => {
    expect(() => v.parse(InterestCreateSchema, validCreate)).not.toThrow()
  })

  it('rejects an empty name', () => {
    expect(() => v.parse(InterestCreateSchema, invalidCreate)).toThrow()
  })
})

describe('InterestUpdateSchema', () => {
  it('accepts a valid update', () => {
    expect(() => v.parse(InterestUpdateSchema, validUpdate)).not.toThrow()
  })

  it('rejects an empty name', () => {
    expect(() => v.parse(InterestUpdateSchema, invalidUpdate)).toThrow()
  })

  it('rejects missing id', () => {
    expect(() => v.parse(InterestUpdateSchema, { name: 'Sports' })).toThrow()
  })
})
