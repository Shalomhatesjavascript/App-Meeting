// ============================================
// Mock Data — BU Connect
// ============================================

export const AVATAR_STYLES = [
  { emoji: '🎨', id: 'notionists', label: 'Notionists' },
  { emoji: '😄', id: 'fun-emoji', label: 'Fun Emoji' },
  { emoji: '🧝', id: 'adventurer', label: 'Adventurer' },
  { emoji: '😊', id: 'big-smile', label: 'Big Smile' },
  { emoji: '🌿', id: 'lorelei', label: 'Lorelei' },
  { emoji: '👤', id: 'personas', label: 'Personas' },
]

export const AVATAR_SEEDS = [
  'felix',
  'aneka',
  'zara',
  'kole',
  'mira',
  'tunde',
  'aisha',
  'chidi',
  'bola',
  'emeka',
  'nadia',
  'seun',
  'tobi',
  'grace',
  'david',
  'funmi',
  'mike',
  'sola',
]

export function getAvatarUrl(style = 'notionists', seed = 'felix', options = {}) {
  const params = new URLSearchParams({
    backgroundColor: 'b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
    seed,
    ...options,
  })
  return `https://api.dicebear.com/7.x/${style}/svg?${params.toString()}`
}

export const INTENTS = [
  { color: '#5a8a72', emoji: '🤝', id: 'friendship', label: 'Friendship' },
  { color: '#e8a020', emoji: '💛', id: 'dating', label: 'Dating' },
  { color: '#2d3580', emoji: '🌐', id: 'networking', label: 'Networking' },
  { color: '#7b6fa0', emoji: '📚', id: 'study_buddy', label: 'Study Buddy' },
]

export const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Accounting',
  'Business Administration',
  'Medicine',
  'Nursing',
  'Law',
  'Mass Communication',
  'Political Science',
  'Psychology',
  'Architecture',
  'Civil Engineering',
  'Electrical Engineering',
  'Biochemistry',
  'Microbiology',
  'Economics',
  'Mathematics',
  'English & Literary Studies',
  'International Relations',
]

export const LEVELS = ['100', '200', '300', '400', '500']

export const INTERESTS = [
  'Reading',
  'Coding',
  'Music',
  'Photography',
  'Fitness',
  'Movies',
  'Gaming',
  'Cooking',
  'Art & Design',
  'Travel',
  'Debate',
  'Sports',
  'Entrepreneurship',
  'Writing',
  'Fashion',
  'Data Science',
  'Volunteering',
  'Dance',
  'Faith & Spirituality',
  'Poetry',
]
