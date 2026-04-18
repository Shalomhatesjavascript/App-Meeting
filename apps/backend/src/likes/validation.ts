import { createInsertSchema, createUpdateSchema } from 'drizzle-valibot'
import { LikesTable } from './schema'

export const LikeInsertSchema = createInsertSchema(LikesTable)
export const LikeUpdateSchema = createUpdateSchema(LikesTable)
