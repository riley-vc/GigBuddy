import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Loader2, ArrowLeft, ChevronRight } from 'lucide-react';

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diffMs = new Date() - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Main DirectChatDrawer — musician-to-musician, no gig/organizer context ──
export default function DirectChatDrawer({
  isOpen,
  onClose,
  conversations,   // full list of DirectConversations for this musician
  conversation,    // active single conversation
  messages,
  currentUserId,
  onSend,
  onSelectConversation,
  loading,
}) {
  const [view, setView] = useState('list');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { if (isOpen) setView('list'); }, [isOpen]);
  useEffect(() => { if (isOpen && conversation) setView('chat'); }, [conversation, isOpen]);
  useEffect(() => {
    if (isOpen && view === 'chat') {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [messages, isOpen, view]);
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

  const otherName = (convo) => {
    if (!convo) return 'Musician';
    return convo.musicianAId?.toString() === currentUserId?.toString() ? convo.musicianBName : convo.musicianAName;
  };
  const unreadFor = (convo) =>
    convo.musicianAId?.toString() === currentUserId?.toString() ? convo.unreadB : convo.unreadA;
  // Note: unread shown here is for the OTHER party from convo's stored perspective;
  // the count relevant to the current viewer is the field matching their own side.
  const myUnread = (convo) =>
    convo.musicianAId?.toString() === currentUserId?.toString() ? convo.unreadA : convo.unreadB;
  void unreadFor;

  const sorted = [...(conversations || [])].sort(
    (a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
  );

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div
        className={`fixed z-50 flex flex-col bg-zinc-950 shadow-2xl transition-transform duration-300 ease-out inset-0
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {view === 'list' && (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-50 leading-tight">Musician Chats</p>
                  <p className="text-[10px] text-zinc-500 font-mono">{sorted.length} conversation{sorted.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button id="close-direct-chat" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-10 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/10 flex items-center justify-center">
                    <MessageSquare className="w-7 h-7 text-violet-400/50" />
                  </div>
                  <p className="text-zinc-400 font-semibold text-sm">No chats yet</p>
                  <p className="text-zinc-600 text-xs">Tap Chat on a musician's profile in Social to start one.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/50">
                  {sorted.map((convo) => {
                    const unread = myUnread(convo);
                    const name = otherName(convo);
                    const initials = (name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
                    return (
                      <button
                        key={convo._id}
                        onClick={() => { setView('chat'); onSelectConversation(convo._id); }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-900/80 transition-colors text-left cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-sm font-semibold truncate ${unread > 0 ? 'text-zinc-50' : 'text-zinc-300'}`}>{name}</span>
                            <span className="text-[10px] text-zinc-600 font-mono shrink-0">{formatRelativeTime(convo.lastMessageAt)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-[11px] truncate italic ${unread > 0 ? 'text-zinc-400' : 'text-zinc-600'}`}>{convo.lastMessage || 'No messages yet'}</p>
                            {unread > 0 && (
                              <span className="min-w-[18px] h-[18px] px-1 bg-violet-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shrink-0">
                                {unread > 9 ? '9+' : unread}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-700 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {view === 'chat' && (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setView('list')} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-violet-400" />
                </div>
                <p className="text-sm font-bold text-zinc-50">{otherName(conversation)}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 min-h-0">
              {loading ? (
                <div className="flex items-center justify-center h-full"><Loader2 className="w-5 h-5 text-violet-400 animate-spin" /></div>
              ) : (messages || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-10">
                  <p className="text-zinc-500 text-sm">No messages yet.</p>
                  <p className="text-zinc-600 text-xs">Say hi!</p>
                </div>
              ) : (
                messages.map((item, idx) => {
                  const isMine = item.senderId?.toString() === currentUserId?.toString();
                  return (
                    <div key={item._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
                      <div className={`max-w-[78%] space-y-1 ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                          isMine ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-sm'
                        }`}>
                          {item.content}
                        </div>
                        <span className="text-[10px] text-zinc-600 px-1">{formatTime(item.sentAt || item.createdAt)}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div className="px-4 pt-4 pb-4 border-t border-zinc-800 shrink-0 pb-safe">
              <form onSubmit={handleSend} className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  id="direct-chat-input"
                  rows={1}
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:border-violet-500 min-h-[44px]"
                  style={{ overflowY: 'hidden' }}
                />
                <button
                  id="direct-chat-send-btn"
                  type="submit"
                  disabled={!draft.trim() || sending}
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white shrink-0 cursor-pointer"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
}
