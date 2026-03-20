// ============================================
// Messages Page — List & Chat view
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMatches, getMessages, sendMessage } from '../../api/matches';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../../components/Avatar';
import { BottomNav } from '../../components/BottomNav';
import { MOCK_USERS } from '../../utils/mockData';

export default function MessagesPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (matchId) {
    return <ChatView matchId={matchId} onBack={() => navigate('/app/messages')} currentUser={user} />;
  }

  return <MessagesList />;
}

// ---- Messages List ----
function MessagesList() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMatches()
      .then(setMatches)
      .catch(() => showToast({ message: 'Failed to load messages', type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={pageStyle}>
      <header style={{ padding: '1.25rem 1.5rem 1rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)' }}>
          Messages
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Your conversations
        </p>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--border-light)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>💬</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', color: 'var(--color-navy)', marginBottom: '0.5rem' }}>
              No messages yet
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>Match with someone to start chatting!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '1rem' }}>
            {matches.map(match => (
              <button
                key={match.id}
                onClick={() => navigate(`/app/messages/${match.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  padding: '0.875rem', background: '#fff',
                  borderRadius: 'var(--radius-lg)', border: 'none',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <Avatar style={match.user?.avatarStyle} seed={match.user?.avatarSeed} size={52} showRing={match.unread > 0} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{match.user?.name}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(match.lastMessageAt)}</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {match.lastMessage || 'Say hi! 👋'}
                  </p>
                </div>
                {match.unread > 0 && (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--color-coral)', color: '#fff', fontSize: '0.6875rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
  );
}

// ---- Chat View ----
function ChatView({ matchId, onBack, currentUser }) {
  const { showToast } = useApp();
  const [messages, setMessages] = useState([]);
  const [matchUser, setMatchUser] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    try {
      const [allMatches, msgs] = await Promise.all([getMatches(), getMessages(matchId)]);
      const match = allMatches.find(m => m.id === matchId);
      setMatchUser(match?.user || null);
      setMessages(msgs);
    } catch {
      showToast({ message: 'Failed to load conversation', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim() || sending) return;
    const messageText = text.trim();
    setText('');
    setSending(true);

    // Optimistic update
    const optimistic = { id: `opt_${Date.now()}`, senderId: 'current', text: messageText, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);

    try {
      const { message } = await sendMessage({ matchId, text: messageText });
      setMessages(prev => prev.map(m => m.id === optimistic.id ? message : m));

      // Simulate reply after delay
      setTimeout(() => {
        const replies = [
          "That's really interesting! Tell me more.",
          "Haha I totally get that 😄",
          "We should definitely talk about this in person sometime.",
          "I've been thinking the same thing actually!",
          "Okay you're officially my favorite person on this app 😂",
        ];
        const reply = { id: `reply_${Date.now()}`, senderId: matchUser?.id || 'u1', text: replies[Math.floor(Math.random() * replies.length)], timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, reply]);
      }, 1500 + Math.random() * 1500);
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      showToast({ message: 'Failed to send message', type: 'error' });
      setText(messageText);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-elevated)' }}>
      {/* Chat header */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: '0.875rem',
        padding: '0.875rem 1.25rem',
        background: '#fff',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky', top: 0, zIndex: 'var(--z-nav)',
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)', padding: '0.25rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        {matchUser && (
          <>
            <Avatar style={matchUser.avatarStyle} seed={matchUser.avatarSeed} size={40} showRing />
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem', lineHeight: 1 }}>{matchUser.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-sage)', marginTop: '2px' }}>Active recently</p>
            </div>
          </>
        )}
      </header>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ width: 28, height: 28, border: '2px solid var(--border-light)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {/* Match banner */}
            <div style={{ textAlign: 'center', margin: '0.5rem 0 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.625rem' }}>
                {matchUser && <Avatar style={matchUser.avatarStyle} seed={matchUser.avatarSeed} size={56} showRing />}
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--color-navy)', fontWeight: 600 }}>
                You matched with {matchUser?.name?.split(' ')[0]}!
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Say something genuine ✨
              </p>
            </div>

            {messages.map((msg, i) => {
              const isMine = msg.senderId === 'current';
              const showAvatar = !isMine && (i === 0 || messages[i - 1]?.senderId !== msg.senderId);
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: '0.5rem', alignItems: 'flex-end' }}>
                  {!isMine && (
                    <div style={{ width: 28, flexShrink: 0 }}>
                      {showAvatar && matchUser && <Avatar style={matchUser.avatarStyle} seed={matchUser.avatarSeed} size={28} />}
                    </div>
                  )}
                  <div style={{
                    maxWidth: '75%',
                    padding: '0.625rem 0.875rem',
                    borderRadius: isMine ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                    background: isMine ? 'var(--color-navy)' : '#fff',
                    color: isMine ? '#fff' : 'var(--text-primary)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.5,
                    boxShadow: 'var(--shadow-sm)',
                    animation: 'fadeSlideUp 0.2s both',
                  }}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: '0.875rem 1rem',
        paddingBottom: 'calc(0.875rem + env(safe-area-inset-bottom))',
        background: '#fff',
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        gap: '0.625rem',
        alignItems: 'flex-end',
      }}>
        <div style={{ flex: 1, background: 'var(--surface-elevated)', borderRadius: 'var(--radius-full)', padding: '0.625rem 1rem', border: '2px solid var(--border-light)', display: 'flex', alignItems: 'center' }}>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
            placeholder="Type a message..."
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'var(--font-body)', fontSize: '0.9375rem',
              color: 'var(--text-primary)', width: '100%',
            }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: text.trim() ? 'var(--color-navy)' : 'var(--border-medium)',
            border: 'none', cursor: text.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background var(--transition-fast)',
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const pageStyle = { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-elevated)', paddingBottom: '64px' };
function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso), n = new Date(), diff = n - d;
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
