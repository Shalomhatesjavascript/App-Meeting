import type { DiscoveryCandidate, MessageSelectDB } from '@repo/backend'
import type { ProfileCreateInput, ProfileUpdateInput } from '@repo/shared'

export type AvatarStyle =
  | ('notionists' | 'fun-emoji' | 'adventurer' | 'big-smile' | 'lorelei' | 'personas')
  | (string & {})

export type AvatarChoice = Readonly<{
  seed: string
  style: AvatarStyle
}>

export type FrontendProfile = Readonly<{
  alias: string
  avatarSeed: string
  avatarStyle: AvatarStyle
  bio: string
  department: string
  fullName: string
  gender: string
  intent: string
  interests: string[]
  isIdVerified: boolean
  level: number
  userId: string
}>

export type ProfileFormValues = Partial<ProfileCreateInput> &
  Readonly<{
    interests?: string[]
  }>

export type ProfileUpdateValues = Partial<ProfileUpdateInput> &
  Readonly<{
    interests?: string[]
  }>

export type SessionRole = 'free' | 'premium' | 'admin'

export type SessionUser = Readonly<{
  createdAt: string
  email: string
  id: string | number | null
  isPremium: boolean
  isVerified: boolean
  name: string
  profile: FrontendProfile | null
  profileComplete: boolean
  role: SessionRole
}>

export type ToastType = 'error' | 'info' | 'success' | 'warning'

export type ToastState = Readonly<{
  id: number
  message: string
  type: ToastType
}>

export type DiscoverCard = Readonly<{
  avatarSeed: string
  avatarStyle: AvatarStyle
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

export type MatchCard = Readonly<{
  id: string
  lastMessage: string | null
  lastMessageAt: string
  matchedAt: string
  unread: number
  user: {
    avatarSeed: string
    avatarStyle: AvatarStyle
    department: string
    id: string
    intent: string
    isVerified: boolean
    level: number
    name: string
  }
  userId: string
}>

export type DiscoverCandidateRow = DiscoveryCandidate

export type BackendMessageRow = MessageSelectDB
