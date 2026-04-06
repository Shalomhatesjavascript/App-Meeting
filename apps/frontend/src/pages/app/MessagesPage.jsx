// ============================================
// Messages Page — List & Chat view
// ============================================

import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMatches, getMessages, sendMessage } from '../../api/matches'
import { Avatar } from '../../components/Avatar'
import { BottomNav } from '../../components/BottomNav'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'

export default function MessagesPage() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  if (matchId) {
    return (
      <ChatView currentUser={user} matchId={matchId} onBack={() => navigate('/app/messages')} />
    )
  }

  return <MessagesList />
}

// ---- Messages List ----
function MessagesList() {
  const navigate = useNavigate()
  const { showToast } = useApp()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMatches()
      .then(setMatches)
      .catch(() => showToast({ message: 'Failed to load messages', type: 'error' }))
      .finally(() => setLoading(false))
  }, [showToast])

  return (
    <div style={pageStyle}>
      <header style={{ padding: '1.25rem 1.5rem 1rem' }}>
        <h1
          style={{
            color: 'var(--color-navy)',
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 600,
          }}
        >
          Messages
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '2px' }}>
          Your conversations
        </p>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div
              style={{
                animation: 'spin 0.8s linear infinite',
                border: '3px solid var(--border-light)',
                borderRadius: '50%',
                borderTopColor: 'var(--color-navy)',
                height: 32,
                width: 32,
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : matches.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '3rem', marginBottom: '1rem' }}>💬</span>
            <h3
              style={{
                color: 'var(--color-navy)',
                fontFamily: 'var(--font-display)',
                fontSize: '1.375rem',
                marginBottom: '0.5rem',
              }}
            >
              No messages yet
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>Match with someone to start chatting!</p>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              paddingBottom: '1rem',
            }}
          >
            {matches.map((match) => (
              <button
                key={match.id}
                onClick={() => navigate(`/app/messages/${match.id}`)}
                style={{
                  alignItems: 'center',
                  background: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '0.875rem',
                  padding: '0.875rem',
                  textAlign: 'left',
                  width: '100%',
                }}
                type="button"
              >
                <Avatar
                  seed={match.user?.avatarSeed}
                  showRing={match.unread > 0}
                  size={52}
                  style={match.user?.avatarStyle}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.2rem',
                    }}
                  >
                    <p
                      style={{
                        color: 'var(--text-primary)',
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                      }}
                    >
                      {match.user?.name}
                    </p>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {formatTime(match.lastMessageAt)}
                    </span>
                  </div>
                  <p
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.875rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {match.lastMessage || 'Say hi! 👋'}
                  </p>
                </div>
                {match.unread > 0 && (
                  <div
                    style={{
                      alignItems: 'center',
                      background: 'var(--color-coral)',
                      borderRadius: '50%',
                      color: '#fff',
                      display: 'flex',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      height: 20,
                      justifyContent: 'center',
                      width: 20,
                    }}
                  >
                    {match.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNav unreadCount={matches.reduce((a, m) => a + (m.unread || 0), 0)} />
    </div>
  )
}

// ---- Chat View ----
function ChatView({ matchId, onBack }) {
  const { showToast } = useApp()
  const [messages, setMessages] = useState([])
  const [matchUser, setMatchUser] = useState(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const loadData = useCallback(async () => {
    try {
      const [allMatches, msgs] = await Promise.all([getMatches(), getMessages(matchId)])
      const match = allMatches.find((m) => m.id === matchId)
      setMatchUser(match?.user || null)
      setMessages(msgs)
    } catch {
      showToast({ message: 'Failed to load conversation', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [matchId, showToast])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!text.trim() || sending) return
    const messageText = text.trim()
    setText('')
    setSending(true)

    // Optimistic update
    const optimistic = {
      id: `opt_${Date.now()}`,
      senderId: 'current',
      text: messageText,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])

    try {
      const { message } = await sendMessage({ matchId, text: messageText })
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? message : m)))
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      showToast({ message: 'Failed to send message', type: 'error' })
      setText(messageText)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div
      style={{
        background: 'var(--surface-elevated)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {/* Chat header */}
      <header
        style={{
          alignItems: 'center',
          background: '#fff',
          borderBottom: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          gap: '0.875rem',
          padding: '0.875rem 1.25rem',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-nav)',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            padding: '0.25rem',
          }}
          type="button"
        >
          <svg
            fill="none"
            height="20"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="20"
          >
            <title>Back</title>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        {matchUser && (
          <>
            <Avatar seed={matchUser.avatarSeed} showRing size={40} style={matchUser.avatarStyle} />
            <div>
              <p
                style={{
                  color: 'var(--text-primary)',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  lineHeight: 1,
                }}
              >
                {matchUser.name}
              </p>
              <p style={{ color: 'var(--color-sage)', fontSize: '0.75rem', marginTop: '2px' }}>
                Active recently
              </p>
            </div>
          </>
        )}
      </header>

      {/* Messages */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          gap: '0.625rem',
          overflowY: 'auto',
          padding: '1rem',
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div
              style={{
                animation: 'spin 0.8s linear infinite',
                border: '2px solid var(--border-light)',
                borderRadius: '50%',
                borderTopColor: 'var(--color-navy)',
                height: 28,
                width: 28,
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {/* Match banner */}
            <div style={{ margin: '0.5rem 0 1rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.625rem' }}>
                {matchUser && (
                  <Avatar
                    seed={matchUser.avatarSeed}
                    showRing
                    size={56}
                    style={matchUser.avatarStyle}
                  />
                )}
              </div>
              <p
                style={{
                  color: 'var(--color-navy)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                You matched with {matchUser?.name?.split(' ')[0]}!
              </p>
              <p
                style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}
              >
                Say something genuine ✨
              </p>
            </div>

            {messages.map((msg, i) => {
              const isMine = msg.senderId === 'current'
              const showAvatar = !isMine && (i === 0 || messages[i - 1]?.senderId !== msg.senderId)
              return (
                <div
                  key={msg.id}
                  style={{
                    alignItems: 'flex-end',
                    display: 'flex',
                    gap: '0.5rem',
                    justifyContent: isMine ? 'flex-end' : 'flex-start',
                  }}
                >
                  {!isMine && (
                    <div style={{ flexShrink: 0, width: 28 }}>
                      {showAvatar && matchUser && (
                        <Avatar
                          seed={matchUser.avatarSeed}
                          size={28}
                          style={matchUser.avatarStyle}
                        />
                      )}
                    </div>
                  )}
                  <div
                    style={{
                      animation: 'fadeSlideUp 0.2s both',
                      background: isMine ? 'var(--color-navy)' : '#fff',
                      borderRadius: isMine ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                      boxShadow: 'var(--shadow-sm)',
                      color: isMine ? '#fff' : 'var(--text-primary)',
                      fontSize: '0.9375rem',
                      lineHeight: 1.5,
                      maxWidth: '75%',
                      padding: '0.625rem 0.875rem',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div
        style={{
          alignItems: 'flex-end',
          background: '#fff',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          gap: '0.625rem',
          padding: '0.875rem 1rem',
          paddingBottom: 'calc(0.875rem + env(safe-area-inset-bottom))',
        }}
      >
        <div
          style={{
            alignItems: 'center',
            background: 'var(--surface-elevated)',
            border: '2px solid var(--border-light)',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            flex: 1,
            padding: '0.625rem 1rem',
          }}
        >
          <input
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
            placeholder="Type a message..."
            ref={inputRef}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              outline: 'none',
              width: '100%',
            }}
            type="text"
            value={text}
          />
        </div>
        <button
          disabled={!text.trim() || sending}
          onClick={handleSend}
          style={{
            alignItems: 'center',
            background: text.trim() ? 'var(--color-navy)' : 'var(--border-medium)',
            border: 'none',
            borderRadius: '50%',
            cursor: text.trim() ? 'pointer' : 'default',
            display: 'flex',
            flexShrink: 0,
            height: 44,
            justifyContent: 'center',
            transition: 'background var(--transition-fast)',
            width: 44,
          }}
          type="button"
        >
          <svg fill="none" height="18" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24" width="18">
            <title>Send message</title>
            <line x1="22" x2="11" y1="2" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

const pageStyle = {
  background: 'var(--surface-elevated)',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  paddingBottom: '64px',
}
function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso),
    n = new Date(),
    diff = n - d
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' })
}
