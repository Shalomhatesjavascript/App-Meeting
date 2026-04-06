// ============================================
// Mock Data — BU Connect
// ============================================

export const AVATAR_STYLES = [
  { id: 'notionists', label: 'Notionists', emoji: '🎨' },
  { id: 'fun-emoji', label: 'Fun Emoji', emoji: '😄' },
  { id: 'adventurer', label: 'Adventurer', emoji: '🧝' },
  { id: 'big-smile', label: 'Big Smile', emoji: '😊' },
  { id: 'lorelei', label: 'Lorelei', emoji: '🌿' },
  { id: 'personas', label: 'Personas', emoji: '👤' },
];

export const AVATAR_SEEDS = [
  'felix', 'aneka', 'zara', 'kole', 'mira', 'tunde',
  'aisha', 'chidi', 'bola', 'emeka', 'nadia', 'seun',
  'tobi', 'grace', 'david', 'funmi', 'mike', 'sola',
];

export function getAvatarUrl(style = 'notionists', seed = 'felix', options = {}) {
  const params = new URLSearchParams({
    seed,
    backgroundColor: 'b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
    ...options,
  });
  return `https://api.dicebear.com/7.x/${style}/svg?${params.toString()}`;
}

export const INTENTS = [
  { id: 'friendship', label: 'Friendship', emoji: '🤝', color: '#5a8a72' },
  { id: 'dating', label: 'Dating', emoji: '💛', color: '#e8a020' },
  { id: 'networking', label: 'Networking', emoji: '🌐', color: '#2d3580' },
  { id: 'study_buddy', label: 'Study Buddy', emoji: '📚', color: '#7b6fa0' },
];

export const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Accounting',
  'Business Administration', 'Medicine', 'Nursing', 'Law',
  'Mass Communication', 'Political Science', 'Psychology',
  'Architecture', 'Civil Engineering', 'Electrical Engineering',
  'Biochemistry', 'Microbiology', 'Economics', 'Mathematics',
  'English & Literary Studies', 'International Relations',
];

export const LEVELS = ['100', '200', '300', '400', '500'];

export const INTERESTS = [
  'Reading', 'Coding', 'Music', 'Photography', 'Fitness',
  'Movies', 'Gaming', 'Cooking', 'Art & Design', 'Travel',
  'Debate', 'Sports', 'Entrepreneurship', 'Writing', 'Fashion',
  'Data Science', 'Volunteering', 'Dance', 'Faith & Spirituality', 'Poetry',
];

export const MOCK_USERS = [
  {
    id: 'u1',
    name: 'Amara Okafor',
    email: 'amara.okafor@student.babcock.edu.ng',
    department: 'Computer Science',
    level: '300',
    gender: 'female',
    intent: 'study_buddy',
    bio: "Final year CS student who loves hackathons and building things that matter. Currently obsessed with distributed systems and Nigerian tech history. I believe the best conversations happen over jollof rice and unsolved algorithms.",
    interests: ['Coding', 'Reading', 'Entrepreneurship', 'Music'],
    avatarStyle: 'notionists',
    avatarSeed: 'amara',
    isVerified: true,
    isPremium: false,
    joinedAt: '2024-09-10',
  },
  {
    id: 'u2',
    name: 'Chibuike Eze',
    email: 'chibuike.eze@student.babcock.edu.ng',
    department: 'Mass Communication',
    level: '200',
    gender: 'male',
    intent: 'friendship',
    bio: "Storyteller, photographer, and chronic overthinker. I document campus life one frame at a time. Looking for people who can hold a real conversation beyond 'how was your day'. Big fan of Afrobeats and existential questions.",
    interests: ['Photography', 'Writing', 'Music', 'Movies'],
    avatarStyle: 'adventurer',
    avatarSeed: 'chibuike',
    isVerified: true,
    isPremium: true,
    joinedAt: '2024-10-02',
  },
  {
    id: 'u3',
    name: 'Zara Adeyemi',
    email: 'zara.adeyemi@student.babcock.edu.ng',
    department: 'Psychology',
    level: '400',
    gender: 'female',
    intent: 'networking',
    bio: "Future clinical psychologist and part-time poet. I notice things people miss and ask questions that linger. I'm building a mental health awareness community on campus — come argue about consciousness with me.",
    interests: ['Poetry', 'Debate', 'Faith & Spirituality', 'Reading'],
    avatarStyle: 'lorelei',
    avatarSeed: 'zara',
    isVerified: true,
    isPremium: false,
    joinedAt: '2024-08-15',
  },
  {
    id: 'u4',
    name: 'Tunde Fashola',
    email: 'tunde.fashola@student.babcock.edu.ng',
    department: 'Business Administration',
    level: '300',
    gender: 'male',
    intent: 'dating',
    bio: "Entrepreneur in the making. I'm building my third venture while trying to pass Financial Accounting. I make a mean jollof rice, debate for fun, and believe compound interest applies to relationships too.",
    interests: ['Entrepreneurship', 'Cooking', 'Sports', 'Fitness'],
    avatarStyle: 'personas',
    avatarSeed: 'tunde',
    isVerified: false,
    isPremium: true,
    joinedAt: '2024-11-01',
  },
  {
    id: 'u5',
    name: 'Nkechi Obi',
    email: 'nkechi.obi@student.babcock.edu.ng',
    department: 'Biochemistry',
    level: '500',
    gender: 'female',
    intent: 'study_buddy',
    bio: "Medical biochem nerd surviving on black coffee and pure determination. I annotate my textbooks like an artist. Looking for study partners who take breaks seriously — because rest is productive. Anime and afropop enthusiast.",
    interests: ['Reading', 'Data Science', 'Music', 'Art & Design'],
    avatarStyle: 'fun-emoji',
    avatarSeed: 'nkechi',
    isVerified: true,
    isPremium: false,
    joinedAt: '2024-07-20',
  },
  {
    id: 'u6',
    name: 'Emeka Nwosu',
    email: 'emeka.nwosu@student.babcock.edu.ng',
    department: 'Electrical Engineering',
    level: '400',
    gender: 'male',
    intent: 'friendship',
    bio: "I build circuits and playlists with equal care. Engineering by day, music producer by night. My love language is sharing songs that perfectly describe what I can't say in words. Let's talk about what moves you.",
    interests: ['Music', 'Coding', 'Fitness', 'Gaming'],
    avatarStyle: 'big-smile',
    avatarSeed: 'emeka',
    isVerified: true,
    isPremium: false,
    joinedAt: '2024-09-25',
  },
];

export const MOCK_MATCHES = [
  {
    id: 'm1',
    userId: 'u2',
    matchedAt: '2024-12-01T10:30:00Z',
    lastMessage: "That photowalk idea sounds amazing! When are you free?",
    lastMessageAt: '2024-12-01T11:00:00Z',
    unread: 2,
  },
  {
    id: 'm2',
    userId: 'u3',
    matchedAt: '2024-11-28T14:00:00Z',
    lastMessage: "I've been thinking about what you said about consciousness...",
    lastMessageAt: '2024-11-29T09:15:00Z',
    unread: 0,
  },
];

export const MOCK_MESSAGES = {
  m1: [
    { id: 'msg1', senderId: 'u2', text: "Hey! I saw you're into photography too 📸", timestamp: '2024-12-01T10:30:00Z' },
    { id: 'msg2', senderId: 'current', text: "Yes! I've been trying to document more of campus life", timestamp: '2024-12-01T10:32:00Z' },
    { id: 'msg3', senderId: 'u2', text: "We should do a photowalk together sometime — the library courtyard at golden hour is insane", timestamp: '2024-12-01T10:35:00Z' },
    { id: 'msg4', senderId: 'current', text: "I'm so down for that!", timestamp: '2024-12-01T10:50:00Z' },
    { id: 'msg5', senderId: 'u2', text: "That photowalk idea sounds amazing! When are you free?", timestamp: '2024-12-01T11:00:00Z' },
  ],
  m2: [
    { id: 'msg6', senderId: 'u3', text: "Hi! Your bio is so real — I also overthink everything lol", timestamp: '2024-11-28T14:00:00Z' },
    { id: 'msg7', senderId: 'current', text: "Haha welcome to the club. What's the last thing you overthought?", timestamp: '2024-11-28T14:10:00Z' },
    { id: 'msg8', senderId: 'u3', text: "Whether consciousness is emergent or fundamental. It kept me up at 2am.", timestamp: '2024-11-28T14:15:00Z' },
    { id: 'msg9', senderId: 'current', text: "Okay that's actually a great question though. What's your stance?", timestamp: '2024-11-29T08:00:00Z' },
    { id: 'msg10', senderId: 'u3', text: "I've been thinking about what you said about consciousness...", timestamp: '2024-11-29T09:15:00Z' },
  ],
};
