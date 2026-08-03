import { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Music,
  Calendar,
  MapPin,
  MessageSquare,
  Loader2,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// Group messages by date for date dividers
function groupByDate(messages) {
  const groups = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const dateLabel = formatDate(msg.sentAt || msg.createdAt);
    if (dateLabel !== lastDate) {
      groups.push({ type: 'divider', label: dateLabel });
      lastDate = dateLabel;
    }
    groups.push({ type: 'message', ...msg });
  });
  return groups;
}

// ─── Conversation List Item ───────────────────────────────────────────────────
function ConvoListItem({ convo, currentRole, onClick }) {
  const unread = currentRole === 'organizer'
    ? (convo.unreadOrganizer || 0)
    : (convo.unreadMusician || 0);
  const otherName = currentRole === 'organizer'
    ? convo.musicianName
    : convo.organizerName;
  const initials = (otherName || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const colors = ['bg-violet-600', 'bg-fuchsia-600', 'bg-indigo-600', 'bg-sky-600', 'bg-emerald-600'];
  const colorIdx = (otherName || '').charCodeAt(0) % colors.length;
  const avatarBg = colors[colorIdx];

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-900/80 transition-colors text-left border-b border-zinc-800/50 last:border-0 cursor-pointer"
    >
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-xl ${avatarBg} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={`text-sm font-semibold truncate ${unread > 0 ? 'text-zinc-50' : 'text-zinc-300'}`}>
            {otherName || 'Unknown'}
          </span>
          <span className="text-[10px] text-zinc-600 font-mono shrink-0">
            {formatRelativeTime(convo.lastMessageAt)}
          </span>
        </div>
        <p className="text-[11px] text-zinc-500 truncate mb-1">
          {convo.gigTitle || 'Gig'}
          {convo.venueName ? ` · ${convo.venueName}` : ''}
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className={`text-[11px] truncate italic ${unread > 0 ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {convo.lastMessage || 'No messages yet'}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {convo.gigBudget > 0 && (
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                ₱{convo.gigBudget.toLocaleString()}
              </span>
            )}
            {unread > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 bg-violet-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow shadow-violet-600/30">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </div>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-zinc-700 shrink-0" />
    </button>
  );
}

// ─── Main ChatDrawer ──────────────────────────────────────────────────────────
export default function ChatDrawer({
  isOpen,
  onClose,
  conversations,         // full list
  conversation,          // active single conversation object
  messages,
  currentUserId,
  currentRole,
  onSend,
  onSelectConversation,  // (conversationId) => void
  loading,
}) {
  // 'list' | 'chat'
  const [view, setView] = useState('list');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // When drawer opens, always start on list view
  useEffect(() => {
    if (isOpen) setView('list');
  }, [isOpen]);

  // When a conversation is selected externally (e.g. from ArtistMarketplace "Open Chat"),
  // jump straight to chat view
  useEffect(() => {
    if (isOpen && conversation) setView('chat');
  }, [conversation, isOpen]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && view === 'chat') {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [messages, isOpen, view]);

  // Focus input when entering chat view
  useEffect(() => {
    if (isOpen && view === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, view]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      await onSend(draft.trim());
      setDraft('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectConvo = (convoId) => {
    setView('chat');
    onSelectConversation(convoId);
  };

  const handleBackToList = () => {
    setView('list');
  };

  const grouped = groupByDate(messages || []);

  const otherName = currentRole === 'organizer'
    ? (conversation?.musicianName  || 'Musician')
    : (conversation?.organizerName || 'Event Planner');

  const sortedConvos = [...(conversations || [])].sort(
    (a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
  );

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer — full-screen on mobile, side panel on sm+ */}
      <div
        className={`fixed z-50 flex flex-col bg-zinc-950 shadow-2xl transition-transform duration-300 ease-out
          inset-0 sm:inset-auto sm:top-0 sm:right-0 sm:h-full sm:w-full sm:max-w-md sm:border-l sm:border-zinc-800
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* ══ LIST VIEW ══════════════════════════════════════════════════════ */}
        {view === 'list' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-50 leading-tight">Messages</p>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    {sortedConvos.length} conversation{sortedConvos.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List body */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {sortedConvos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-10 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/10 flex items-center justify-center">
                    <MessageSquare className="w-7 h-7 text-violet-400/50" />
                  </div>
                  <div>
                    <p className="text-zinc-400 font-semibold text-sm">No chats yet</p>
                    <p className="text-zinc-600 text-xs mt-1 leading-relaxed">
                      {currentRole === 'organizer'
                        ? 'Send an invite to an artist to start a conversation.'
                        : 'Apply to a gig or wait for a planner invitation to start chatting.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/50">
                  {sortedConvos.map((convo) => (
                    <ConvoListItem
                      key={convo._id}
                      convo={convo}
                      currentRole={currentRole}
                      onClick={() => handleSelectConvo(convo._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ══ CHAT VIEW ══════════════════════════════════════════════════════ */}
        {view === 'chat' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToList}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Back to messages"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-50 leading-tight">
                    {otherName}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    {currentRole === 'organizer' ? 'Artist Chat' : 'Planner Chat'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Gig Context Card */}
            {conversation && (
              <div className="mx-4 mt-4 p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl shrink-0">
                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">Gig Context</p>
                <p className="text-sm font-bold text-zinc-100 truncate">{conversation.gigTitle || 'Gig'}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                  {conversation.venueName && (
                    <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                      <MapPin className="w-3 h-3 text-zinc-500" />
                      {conversation.venueName}
                    </span>
                  )}
                  {conversation.gigBudget > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                      ₱{conversation.gigBudget.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 min-h-0">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                </div>
              ) : grouped.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-10">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/10 flex items-center justify-center">
                    <Music className="w-5 h-5 text-violet-400" />
                  </div>
                  <p className="text-zinc-500 text-sm">No messages yet.</p>
                  <p className="text-zinc-600 text-xs">Start the conversation below!</p>
                </div>
              ) : (
                grouped.map((item, idx) => {
                  if (item.type === 'divider') {
                    return (
                      <div key={`divider-${idx}`} className="flex items-center gap-3 py-3">
                        <div className="flex-1 h-px bg-zinc-800" />
                        <span className="text-[10px] font-mono text-zinc-600 px-2">{item.label}</span>
                        <div className="flex-1 h-px bg-zinc-800" />
                      </div>
                    );
                  }

                  const isMine = item.senderRole === currentRole;
                  return (
                    <div
                      key={item._id || idx}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}
                    >
                      <div className={`max-w-[78%] space-y-1 ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                        {!isMine && (
                          <span className="text-[10px] text-zinc-500 px-1">{item.senderName}</span>
                        )}
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                            isMine
                              ? 'bg-violet-600 text-white rounded-br-sm shadow-lg shadow-violet-600/20'
                              : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-sm'
                          }`}
                        >
                          {item.content}
                        </div>
                        <span className="text-[10px] text-zinc-600 px-1">
                          {formatTime(item.sentAt || item.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Bar */}
            <div className="px-4 pt-4 pb-4 border-t border-zinc-800 bg-zinc-950 shrink-0 pb-safe">
              <form onSubmit={handleSend} className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  id="chat-message-input"
                  rows={1}
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send)"
                  className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-600 min-h-[44px]"
                  style={{ overflowY: 'hidden' }}
                />
                <button
                  id="chat-send-btn"
                  type="submit"
                  disabled={!draft.trim() || sending}
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all shadow-lg shadow-violet-600/20 shrink-0 cursor-pointer"
                >
                  {sending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                </button>
              </form>
              <p className="text-[10px] text-zinc-700 mt-1.5 text-center font-mono hidden sm:block">
                Shift+Enter for new line
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
