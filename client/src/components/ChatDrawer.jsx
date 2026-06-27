import { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Music,
  Calendar,
  DollarSign,
  MapPin,
  MessageSquare,
  Loader2,
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

// Group messages by date for date dividers
function groupByDate(messages) {
  const groups = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const dateLabel = formatDate(msg.sentAt);
    if (dateLabel !== lastDate) {
      groups.push({ type: 'divider', label: dateLabel });
      lastDate = dateLabel;
    }
    groups.push({ type: 'message', ...msg });
  });
  return groups;
}

export default function ChatDrawer({
  isOpen,
  onClose,
  conversation,
  messages,
  currentUserId,
  currentRole,
  onSend,
  loading,
}) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [messages, isOpen]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

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

  const grouped = groupByDate(messages || []);

  const otherName = currentRole === 'organizer'
    ? (conversation?.musicianName  || 'Musician')
    : (conversation?.organizerName || 'Event Planner');

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md flex flex-col bg-white border-l border-gray-200 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">
                {otherName}
              </p>
              <p className="text-[10px] text-gray-500 font-mono">
                {currentRole === 'organizer' ? 'Artist Chat' : 'Planner Chat'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Gig Context Card ────────────────────────────────────────────────── */}
        {conversation && (
          <div className="mx-4 mt-4 p-3.5 bg-gray-50 border border-gray-200 rounded-xl shrink-0">
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1.5">Gig Context</p>
            <p className="text-sm font-bold text-gray-900 truncate">{conversation.gigTitle || 'Gig'}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              {conversation.venueName && (
                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  {conversation.venueName}
                </span>
              )}
              {conversation.gigBudget > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-mono">
                  <DollarSign className="w-3 h-3" />
                  {conversation.gigBudget.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Messages ────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            </div>
          ) : grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Music className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-gray-500 text-sm">No messages yet.</p>
              <p className="text-gray-400 text-xs">Start the conversation below!</p>
            </div>
          ) : (
            grouped.map((item, idx) => {
              if (item.type === 'divider') {
                return (
                  <div key={`divider-${idx}`} className="flex items-center gap-3 py-3">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-[10px] font-mono text-gray-400 px-2">{item.label}</span>
                    <div className="flex-1 h-px bg-gray-100" />
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
                    {/* Sender name (other party only) */}
                    {!isMine && (
                      <span className="text-[10px] text-gray-500 px-1">{item.senderName}</span>
                    )}
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                        isMine
                          ? 'bg-indigo-600 text-white rounded-br-sm shadow-sm'
                          : 'bg-gray-100 text-gray-900 border border-gray-200 rounded-bl-sm'
                      }`}
                    >
                      {item.content}
                    </div>
                    <span className="text-[10px] text-gray-400 px-1">
                      {formatTime(item.sentAt)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Input Bar ───────────────────────────────────────────────────────── */}
        <div className="px-4 py-4 border-t border-gray-100 bg-white shrink-0">
          <form onSubmit={handleSend} className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              id="chat-message-input"
              rows={1}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                // Auto-grow textarea up to 4 rows
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-gray-400 min-h-[40px]"
              style={{ overflowY: 'hidden' }}
            />
            <button
              id="chat-send-btn"
              type="submit"
              disabled={!draft.trim() || sending}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all shadow-md shrink-0 cursor-pointer"
            >
              {sending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
            </button>
          </form>
          <p className="text-[10px] text-gray-400 mt-1.5 text-center font-mono">
            Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
}
