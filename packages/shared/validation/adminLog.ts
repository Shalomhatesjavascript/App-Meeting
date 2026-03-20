import * as v from 'valibot'

/**
 * Schema for creating a new admin log entry.
 * - admin_id: integer (required)
 * - action: string (required, max 255 chars)
 * - target_user_id: integer (optional)
 * - timestamp: string (optional, ISO format)
 */
export const AdminLogCreateSchema = v.object({
  admin_id: v.number(),
  action: v.pipe(
    v.string(),
    v.custom(
      (val) => typeof val === 'string' && val.length <= 255,
      'Action must be 255 chars or less',
    ),
  ),
  target_user_id: v.optional(v.number()),
  timestamp: v.optional(v.string()),
})
export type AdminLogCreateInput = v.InferInput<typeof AdminLogCreateSchema>
export type AdminLogCreateOutput = v.InferOutput<typeof AdminLogCreateSchema>

/**
 * Schema for updating an admin log entry (rare, but for completeness).
 * All fields optional.
 */
export const AdminLogUpdateSchema = v.object({
  admin_id: v.optional(v.number()),
  action: v.optional(
    v.pipe(
      v.string(),
      v.custom(
        (val) => typeof val === 'string' && val.length <= 255,
        'Action must be 255 chars or less',
      ),
    ),
  ),
  target_user_id: v.optional(v.number()),
  timestamp: v.optional(v.string()),
})
export type AdminLogUpdateInput = v.InferInput<typeof AdminLogUpdateSchema>
export type AdminLogUpdateOutput = v.InferOutput<typeof AdminLogUpdateSchema>
