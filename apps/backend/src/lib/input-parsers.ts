import { NonNegativeIntSchema, PositiveIntSchema } from '@repo/shared'
import * as v from 'valibot'

const PositiveIntFromUnknownSchema = v.pipe(
  v.union([v.string(), v.number()]),
  v.transform((value) => (typeof value === 'number' ? value : Number(value))),
  PositiveIntSchema,
)

const NonNegativeIntFromUnknownSchema = v.pipe(
  v.union([v.string(), v.number()]),
  v.transform((value) => (typeof value === 'number' ? value : Number(value))),
  NonNegativeIntSchema,
)

type ParseResult =
  | {
      success: true
      value: number
    }
  | {
      success: false
    }

export function parsePositiveInt(value: unknown): ParseResult {
  const parsed = v.safeParse(PositiveIntFromUnknownSchema, value)
  if (!parsed.success) {
    return { success: false }
  }

  return {
    success: true,
    value: parsed.output,
  }
}

export function parseNonNegativeInt(value: unknown): ParseResult {
  const parsed = v.safeParse(NonNegativeIntFromUnknownSchema, value)
  if (!parsed.success) {
    return { success: false }
  }

  return {
    success: true,
    value: parsed.output,
  }
}
