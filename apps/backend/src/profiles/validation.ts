import { UniversityLevelSchema } from '@repo/shared'
import { createInsertSchema, createUpdateSchema } from 'drizzle-valibot'
import * as v from 'valibot'
import { ProfilesTable } from './schema'

export const ProfileInsertSchema = createInsertSchema(ProfilesTable, {
  level: (schema) => v.pipe(schema, UniversityLevelSchema),
  userId: (schema) => v.optional(schema),
})
export const ProfileUpdateSchema = createUpdateSchema(ProfilesTable, {
  level: (schema) => v.pipe(schema, UniversityLevelSchema),
})
