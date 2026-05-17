import type { MatchSelectDB, MessageSelectDB, ProfileSelectDB } from '@repo/backend'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authClient } from '../lib/auth-client'
import backendApi from '../server/eden-treaty'
import type { ChatMessage, MatchCard } from '../types'
import { queryKeys } from './query-keys'

async function getCurrentUserId() {
  const session = await authClient.getSession()
  return session.data?.user.id ?? null
}

function toChatMessage(message: MessageSelectDB, currentUserId: string): ChatMessage {
  return {
    id: String(message.id),
    senderId: message.senderId === currentUserId ? 'current' : message.senderId,
    text: message.content,
    timestamp: new Date(message.createdAt).toISOString(),
  }
}

function toMatchCard(
  match: MatchSelectDB,
  otherProfile: ProfileSelectDB | null,
  lastMessage: MessageSelectDB | null,
  unreadCount: number,
  currentUserId: string,
): MatchCard {
  return {
    id: String(match.id),
    lastMessage: lastMessage ? lastMessage.content : null,
    lastMessageAt: (lastMessage ?? match).createdAt.toISOString(),
    matchedAt: match.createdAt.toISOString(),
    unread: unreadCount,
    user: {
      avatarSeed: otherProfile?.avatarSeed || 'default',
      avatarStyle: otherProfile?.avatarStyle || 'notionists',
      bio: otherProfile?.bio || undefined,
      department: otherProfile?.department || '',
      id: match.user1Id === currentUserId ? match.user2Id : match.user1Id,
      intent: otherProfile?.intent || 'friendship',
      isVerified: otherProfile?.isIdVerified ?? false,
      level: otherProfile?.level || 100,
      name: otherProfile?.alias || 'Match',
    },
    userId: match.user1Id === currentUserId ? match.user2Id : match.user1Id,
  }
}

export function useMatchesQuery() {
  return useQuery({
    queryFn: async () => {
      const currentUserId = await getCurrentUserId()
      if (!currentUserId) return []

      const { data } = await backendApi.api.matches.get()
      const matches = (data?.data ?? []) as MatchSelectDB[]

      const cards = await Promise.all(
        matches.map(async (match) => {
          const otherUserId = match.user1Id === currentUserId ? match.user2Id : match.user1Id

          const [profileResponse, messagesResponse] = await Promise.all([
            backendApi.api
              .profiles({ id: otherUserId })
              .get()
              .catch(() => ({ data: null })),
            backendApi.api.messages.match({ match_id: match.id }).get({
              query: { limit: 100, matchId: match.id },
            }),
          ])

          const otherProfile = profileResponse.data as ProfileSelectDB | null
          const messages = (messagesResponse.data ?? []) as MessageSelectDB[]
          const lastMessage = messages[messages.length - 1] || null
          const unreadCount = messages.filter(
            (message) => !message.isRead && message.senderId !== currentUserId,
          ).length

          return toMatchCard(match, otherProfile, lastMessage, unreadCount, currentUserId)
        }),
      )

      return cards
    },
    queryKey: queryKeys.matches(),
  })
}

export function useMatchQuery(matchId: number, enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const { data } = await backendApi.api.matches({ id: matchId }).get()
      return data
    },
    queryKey: queryKeys.match(matchId),
  })
}

export function useMessagesQuery(matchId: number, enabled = true) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const currentUserId = await getCurrentUserId()
      if (!currentUserId) return []

      const { data } = await backendApi.api.messages.match({ match_id: matchId }).get({
        query: { limit: 30, matchId },
      })

      return ((data ?? []) as MessageSelectDB[]).map((message) =>
        toChatMessage(message, currentUserId),
      )
    },
    queryKey: queryKeys.messages(matchId),
  })
}

export function useSendMessageMutation(matchId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (arg: Readonly<{ text: string }>) => {
      const currentUserId = await getCurrentUserId()
      if (!currentUserId) {
        throw new Error('Unable to determine the current user')
      }

      const { data } = await backendApi.api.messages.post({
        content: arg.text,
        matchId,
        senderId: currentUserId,
      })

      if (!data) {
        throw new Error('Failed to send message')
      }

      return { message: toChatMessage(data as MessageSelectDB, currentUserId) }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.messages(matchId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.matches() })
    },
  })
}

export function useMarkMessageReadMutation(messageId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => backendApi.api.messages({ id: messageId }).read.post(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.messages(messageId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.matches() })
    },
  })
}
