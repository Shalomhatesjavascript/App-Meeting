import type { DB } from '../utils/db'
import type { DiscoveryCandidate } from './matching'
import { getDiscoveryCandidates } from './matching'

export async function getDiscoveryFeed(
  db: DB,
  userId: string,
  limit = 50,
  offset = 0,
): Promise<DiscoveryCandidate[]> {
  return getDiscoveryCandidates(db, userId, limit, offset)
}

export async function getRecommendations(
  db: DB,
  userId: string,
  limit = 50,
  offset = 0,
): Promise<DiscoveryCandidate[]> {
  return getDiscoveryCandidates(db, userId, limit, offset)
}

export async function getPossibleMatches(
  db: DB,
  userId: string,
  limit = 20,
  offset = 0,
  minScore = 100,
): Promise<DiscoveryCandidate[]> {
  const candidates = await getDiscoveryCandidates(db, userId, limit, offset)
  return candidates.filter((candidate) => candidate.score >= minScore)
}
