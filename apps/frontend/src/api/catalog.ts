import backendApi from '../server/eden-treaty'
import { getAuthHeaders } from './auth'

export const INTENTS = [
  { color: '#5a8a72', emoji: '🤝', id: 'friendship', label: 'Friendship' },
  { color: '#e8a020', emoji: '💛', id: 'dating', label: 'Dating' },
  { color: '#2d3580', emoji: '🌐', id: 'networking', label: 'Networking' },
  { color: '#7b6fa0', emoji: '📚', id: 'study buddy', label: 'Study Buddy' },
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

export const LEVELS = ['100', '200', '300', '400', '500'] as const

const FALLBACK_INTERESTS = [
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

export async function getInterestsCatalog(): Promise<readonly string[]> {
  try {
    const { data, error } = await backendApi.api.interests.get({ headers: getAuthHeaders() })

    if (error) {
      return FALLBACK_INTERESTS
    }

    const rows = Array.isArray(data) ? data : []
    const names = rows.map((row: { name?: string }) => row.name).filter(Boolean) as string[]

    return names.length > 0 ? names : FALLBACK_INTERESTS
  } catch {
    return FALLBACK_INTERESTS
  }
}
