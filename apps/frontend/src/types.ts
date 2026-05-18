import type { ProfileSelectDB } from '@repo/backend'

export type AvatarChoice = Pick<ProfileSelectDB, 'avatarSeed' | 'avatarStyle'>
export type AvatarStyle = AvatarChoice['avatarStyle']

export type ToastType = 'error' | 'info' | 'success' | 'warning'

export type ToastState = Readonly<{
  id: number
  message: string
  type: ToastType
}>

export type FrontendProfile = Readonly<ProfileSelectDB & { interests: string[] }>

export type ProfileFormValues = Readonly<{
  alias: string
  avatarSeed: string
  avatarStyle: ProfileSelectDB['avatarStyle']
  bio: string
  department: string
  fullName: string
  gender: ProfileSelectDB['gender']
  intent: ProfileSelectDB['intent']
  interests: string[]
  isIdVerified: boolean
  isComplete?: boolean
  level: ProfileSelectDB['level']
  userId?: string
}>

export type ProfileUpdateValues = Partial<ProfileFormValues>

export type DiscoverCard = Readonly<{
  avatarSeed: string
  avatarStyle: AvatarChoice['avatarStyle']
  bio: string
  department: string
  id: string
  intent: string
  interestNames: string[]
  isVerified: boolean
  level: number

  matchScore?: number
  name: string
}>

export type ChatMessage = Readonly<{
  id: string
  senderId: 'current' | string
  text: string
  timestamp: string
}>

// TODO: base off backend types
export type MatchCard = Readonly<{
  id: string
  lastMessage: string | null
  lastMessageAt: string
  matchedAt: string
  unread: number
  user: {
    avatarSeed: string
    avatarStyle: AvatarChoice['avatarStyle']
    bio?: string
    department: string
    id: string
    intent: string
    isVerified: boolean
    level: number
    name: string
  }
  userId: string
}>
