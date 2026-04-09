import * as v from 'valibot'

export const BABCOCK_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(student\.)?babcock\.edu\.ng$/

export const PositiveIntSchema = v.pipe(
  v.number(),
  v.finite(),
  v.integer(),
  v.safeInteger(),
  v.minValue(1),
)

export const NonNegativeIntSchema = v.pipe(
  v.number(),
  v.finite(),
  v.integer(),
  v.safeInteger(),
  v.minValue(0),
)

export const BabcockEmailSchema = v.pipe(
  v.string(),
  v.trim(),
  v.email(),
  v.regex(BABCOCK_EMAIL_REGEX, 'Email must be a Babcock student or staff email'),
)

export const StrongPasswordSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(8, 'Password must be at least 8 characters'),
  v.regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    'Password must include uppercase, lowercase, and a number',
  ),
)

export const IsoTimestampSchema = v.pipe(v.string(), v.trim(), v.isoTimestamp())
