import { createInsertSchema, createUpdateSchema } from 'drizzle-valibot'
import * as v from 'valibot'
import { MatchesTable } from './schema'

export const MatchInsertSchema = createInsertSchema(MatchesTable)
export const MatchUpdateSchema = createUpdateSchema(MatchesTable)
