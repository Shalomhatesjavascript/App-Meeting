import type { MatchCreateInput } from '@repo/shared'

/**
 * Model functions for matches.
 * These should be implemented to interact with the database.
 */
export const createMatch = async (_input: MatchCreateInput) => {
  // TODO: Insert a new match into the database
  // Example: await db.insert(matchesTable).values(input)
  throw new Error('Not implemented')
}

export const getMatchById = async (_id: number) => {
  // TODO: Fetch a match by its ID from the database
  throw new Error('Not implemented')
}

export const listMatchesForUser = async (_userId: number) => {
  // TODO: Fetch all matches for a given user
  throw new Error('Not implemented')
}
