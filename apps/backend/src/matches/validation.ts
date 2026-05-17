import { createInsertSchema, createUpdateSchema } from 'drizzle-valibot'
import { MatchesTable } from './schema'

export const MatchInsertSchema = createInsertSchema(MatchesTable)
export const MatchUpdateSchema = createUpdateSchema(MatchesTable)
