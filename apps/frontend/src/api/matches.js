// ============================================
// Mock Matches API — BU Connect
// ============================================

import { MOCK_USERS, MOCK_MATCHES, MOCK_MESSAGES } from '../utils/mockData';

const delay = (ms = 600) => new Promise(res => setTimeout(res, ms));
const SWIPE_KEY = 'bu_connect_swipes';
const MATCHES_KEY = 'bu_connect_matches';

/**
 * Returns the discovery queue (users not yet swiped).
 */
export async function getDiscoverUsers() {
  await delay(500);
  const swipes = getSwipes();
  return MOCK_USERS.filter(u => !swipes[u.id]);
}

/**
 * Records a swipe action (like or pass).
 */
export async function swipeUser({ userId, action }) {
  await delay(400);
  const swipes = getSwipes();
  swipes[userId] = action;
  localStorage.setItem(SWIPE_KEY, JSON.stringify(swipes));

  // Simulate a match: 40% chance when user likes
  if (action === 'like') {
    const isMatch = Math.random() < 0.4;
    if (isMatch) {
      await createMatch(userId);
      return { matched: true, userId };
    }
  }

  return { matched: false };
}

/**
 * Returns all matches with last message preview.
 */
export async function getMatches() {
  await delay(500);
  const stored = localStorage.getItem(MATCHES_KEY);
  const localMatches = stored ? JSON.parse(stored) : [];

  // Combine with mock matches for demo richness
  const allMatches = [...MOCK_MATCHES, ...localMatches];

  return allMatches.map(match => ({
    ...match,
    user: MOCK_USERS.find(u => u.id === match.userId),
  })).filter(m => m.user);
}

/**
 * Returns messages for a specific match.
 */
export async function getMessages(matchId) {
  await delay(400);
  return MOCK_MESSAGES[matchId] || [];
}

/**
 * Sends a message in a match conversation.
 */
export async function sendMessage({ matchId, text }) {
  await delay(300);
  const message = {
    id: `msg_${Date.now()}`,
    senderId: 'current',
    text,
    timestamp: new Date().toISOString(),
  };
  return { message };
}

// ---- Internal helpers ----

function getSwipes() {
  const stored = localStorage.getItem(SWIPE_KEY);
  return stored ? JSON.parse(stored) : {};
}

async function createMatch(userId) {
  const stored = localStorage.getItem(MATCHES_KEY);
  const matches = stored ? JSON.parse(stored) : [];
  matches.push({
    id: `match_${Date.now()}`,
    userId,
    matchedAt: new Date().toISOString(),
    lastMessage: null,
    lastMessageAt: null,
    unread: 0,
  });
  localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
}

/**
 * Resets all swipes (for dev/testing).
 */
export function resetSwipes() {
  localStorage.removeItem(SWIPE_KEY);
  localStorage.removeItem(MATCHES_KEY);
}
