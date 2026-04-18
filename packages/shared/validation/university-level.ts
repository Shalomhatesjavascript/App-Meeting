import * as v from 'valibot'

export const UniversityLevelSchema = v.picklist([100, 200, 300, 400, 500, 600])
export type UniversityLevelOutput = v.InferOutput<typeof UniversityLevelSchema>
