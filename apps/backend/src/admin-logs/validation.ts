import { createInsertSchema, createUpdateSchema } from 'drizzle-valibot'
import * as v from 'valibot'
import { AdminLogTable } from './schema'

const PositiveIntSchema = v.pipe(
  v.unknown(),
  v.toNumber(),
  v.finite(),
  v.integer(),
  v.safeInteger(),
  v.minValue(1),
)

const ActionDescriptionSchema = v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(255))

export const AdminLogCreateSchema = createInsertSchema(AdminLogTable, {
  action: (schema) => v.pipe(schema, ActionDescriptionSchema),
})

export const AdminLogUpdateSchema = createUpdateSchema(AdminLogTable)

export const AdminLogListQuerySchema = v.partial(
  v.object({
    /** The description of the action the admin took. Maybe I should make this an enum later */
    action: ActionDescriptionSchema,
    adminId: v.optional(v.string()),
    from: v.optional(v.date()),
    targetUserId: v.optional(v.string()),
    to: v.optional(v.date()),
  }),
)
export type AdminLogListQueryInput = v.InferInput<typeof AdminLogListQuerySchema>
export type AdminLogListQueryOutput = v.InferOutput<typeof AdminLogListQuerySchema>
