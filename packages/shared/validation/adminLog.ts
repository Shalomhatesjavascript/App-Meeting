import * as v from 'valibot'
import { IsoTimestampSchema, PositiveIntSchema } from './common'

/**
 * Schema for creating a new admin log entry.
 * - admin_id: integer (required)
 * - action: string (required, max 255 chars)
 * - target_user_id: integer (optional)
 * - timestamp: string (optional, ISO format)
 */
export const AdminLogCreateSchema = v.object({
  action: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(255)),
  admin_id: PositiveIntSchema,
  target_user_id: v.optional(PositiveIntSchema),
  timestamp: v.optional(IsoTimestampSchema),
})
export type AdminLogCreateInput = v.InferInput<typeof AdminLogCreateSchema>
export type AdminLogCreateOutput = v.InferOutput<typeof AdminLogCreateSchema>

/**
 * Schema for updating an admin log entry (rare, but for completeness).
 * All fields optional.
 */
export const AdminLogUpdateSchema = v.object({
  action: v.optional(v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(255))),
  admin_id: v.optional(PositiveIntSchema),
  target_user_id: v.optional(PositiveIntSchema),
  timestamp: v.optional(IsoTimestampSchema),
})
export type AdminLogUpdateInput = v.InferInput<typeof AdminLogUpdateSchema>
export type AdminLogUpdateOutput = v.InferOutput<typeof AdminLogUpdateSchema>

export const AdminLogListQuerySchema = v.object({
  action: v.optional(v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(255))),
  admin_id: v.optional(PositiveIntSchema),
  from: v.optional(IsoTimestampSchema),
  target_user_id: v.optional(PositiveIntSchema),
  to: v.optional(IsoTimestampSchema),
})
export type AdminLogListQueryInput = v.InferInput<typeof AdminLogListQuerySchema>
export type AdminLogListQueryOutput = v.InferOutput<typeof AdminLogListQuerySchema>
