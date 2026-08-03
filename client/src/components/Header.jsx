import { Radio, Disc, MessageSquare, HelpCircle, LogOut } from 'lucide-react';

export default function Header({
  role,
  userName,
  userAvatar,
  escrowTotal,
  unreadMessages,
  onOpenChat,
  onOpenHelp,
  onLogout,
}) {
  return (
    <header id="app-header" className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-3">

          {/* Logo & Platform Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-violet-600 flex items-center justify-center text-zinc-50 shadow-lg shadow-violet-600/20 relative overflow-hidden group shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500 to-violet-600 opacity-50 group-hover:scale-110 transition-transform duration-300" />
              <Disc className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" style={{ animation: 'spin 8s linear infinite' }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-zinc-50 tracking-tight text-base sm:text-lg">GigBag</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-violet-500/10 text-violet-400 font-mono font-bold rounded border border-violet-500/20 uppercase tracking-widest">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 tracking-wide hidden sm:block">Musician Marketplace • PH Gig Network</p>
            </div>
          </div>

          {/* Escrow Status — desktop only */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="font-mono text-xs">
                <span className="text-zinc-500">Escrow Secured: </span>
                <span className="text-emerald-400 font-bold">₱{escrowTotal.toLocaleString()}</span>
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

          {/* Right side controls */}
          <div className="flex items-center gap-2">

            {/* Help button */}
            <button
              id="header-help-btn"
              onClick={onOpenHelp}
              title="How to use GigBag"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-50 hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Chat bell — desktop only (mobile uses BottomNav) */}
            <button
              id="header-chat-bell"
              onClick={onOpenChat}
              title="Open messages"
              className="relative w-9 h-9 hidden sm:flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-50 hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-violet-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-violet-600/30">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </button>

            {/* User name + role — desktop only */}
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-zinc-200 block">{userName}</span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded uppercase tracking-wider mt-0.5 inline-block">
                {role === 'organizer' ? 'Event Planner' : 'Professional Artist'}
              </span>
            </div>

            {/* Avatar */}
            <button
              id="user-profile-menu-button"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900 p-0.5 cursor-pointer hover:border-zinc-700 transition-colors shrink-0"
            >
              <img
                referrerPolicy="no-referrer"
                src={userAvatar}
                alt={userName}
                className="w-full h-full object-cover rounded-[10px]"
              />
            </button>

            {/* Logout — icon only on mobile, text+icon on desktop */}
            <button
              id="btn-logout"
              onClick={onLogout}
              title="Log out"
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-zinc-900/90 border border-zinc-700/60 hover:border-red-500/50 text-zinc-400 hover:text-red-400 text-xs font-semibold rounded-lg backdrop-blur-sm transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
