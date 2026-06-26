import { Radio, Disc, MessageSquare } from 'lucide-react';

export default function Header({ role, userName, userAvatar, escrowTotal, unreadMessages, onOpenChat }) {
  return (
    <header id="app-header" className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo & Platform Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-zinc-50 shadow-lg shadow-violet-600/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500 to-violet-600 opacity-50 group-hover:scale-110 transition-transform duration-300" />
              <Disc className="w-5 h-5 relative z-10" style={{ animation: 'spin 8s linear infinite' }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-zinc-50 tracking-tight text-lg">GigBag</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-violet-500/10 text-violet-400 font-mono font-bold rounded border border-violet-500/20 uppercase tracking-widest">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 tracking-wide">Musician Marketplace • PH Gig Network</p>
            </div>
          </div>

          {/* Escrow Status */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="font-mono text-xs">
                <span className="text-zinc-500">Escrow Secured: </span>
                <span className="text-emerald-400 font-bold">${escrowTotal}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
              <Radio className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
              <div className="text-[11px] font-mono text-zinc-400">
                <span className="text-zinc-500">Live Sync: </span>
                <span>Active</span>
              </div>
            </div>
          </div>

          {/* Right side: Chat bell + User */}
          <div className="flex items-center gap-3">
            {/* Chat Notification Bell */}
            <button
              id="header-chat-bell"
              onClick={onOpenChat}
              title="Open messages"
              className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-50 hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-violet-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-violet-600/30">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </button>

            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-zinc-200 block">{userName}</span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded uppercase tracking-wider mt-0.5 inline-block">
                {role === 'organizer' ? 'Event Planner' : 'Professional Artist'}
              </span>
            </div>
            <button
              id="user-profile-menu-button"
              className="w-10 h-10 rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900 p-0.5 cursor-pointer hover:border-zinc-700 transition-colors"
            >
              <img
                referrerPolicy="no-referrer"
                src={userAvatar}
                alt={userName}
                className="w-full h-full object-cover rounded-[10px]"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
