import * as sqlite from 'drizzle-orm/sqlite-core'
import { InterestNameEnum } from './enum'

// Interests are stored in a dedicated table to enable many-to-many relations
// (via `user_interests`) and to keep interest canonical values centralized
// for discovery scoring and UI selection.
export const InterestsTable = sqlite.sqliteTable('interests', {
  id: sqlite.integer().primaryKey({ autoIncrement: true }),
  name: sqlite
    .text({
      enum: [...InterestNameEnum.$.values()] as [InterestNameEnum, ...InterestNameEnum[]],
      // length: 50,
    })
    .notNull()
    .unique(),
})

export type InterestSelectDB = Readonly<typeof InterestsTable.$inferSelect>
export type InterestInsertDB = Readonly<typeof InterestsTable.$inferInsert>
export type InterestUpdateDB = Partial<InterestInsertDB>
