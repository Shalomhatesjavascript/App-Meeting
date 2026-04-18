import * as sqlite from 'drizzle-orm/sqlite-core'
import { InterestNameEnum } from './enum'

// TODO: IS there a point of this if I can just include the interest directly in the user table?
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
