import { createInsertSchema, createUpdateSchema } from 'drizzle-valibot'
import { InterestsTable } from './schema'

export const InterestInsertSchema = createInsertSchema(InterestsTable)
export const InterestUpdateSchema = createUpdateSchema(InterestsTable)
