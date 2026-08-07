import { Briefcase, Compass, Sparkles, Store, MessageSquare, UserCircle, UsersRound } from 'lucide-react';

export default function BottomNav({
  role,
  organizerTab,
  musicianTab,
  unreadMessages,
  onOrganizerTab,
  onMusicianTab,
  onOpenChat,
  onOrganizerProfile,
}) {
  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
    >
      <div className="flex items-end justify-around px-2 pt-1.5 pb-1">
        {role === 'organizer' ? (
          <>
            {/* Dashboard */}
            <BottomNavItem
              id="bnav-org-dashboard"
              label="Dashboard"
              icon={<Briefcase className="w-5 h-5" />}
              active={organizerTab === 'dashboard'}
              onClick={() => onOrganizerTab('dashboard')}
            />
            {/* Artists */}
            <BottomNavItem
              id="bnav-org-artists"
              label="Artists"
              icon={<Store className="w-5 h-5" />}
              active={organizerTab === 'artist_marketplace'}
              onClick={() => onOrganizerTab('artist_marketplace')}
            />
            {/* Post Gig — FAB centre button */}
            <PostGigFab
              active={organizerTab === 'create_gig'}
              onClick={() => onOrganizerTab('create_gig')}
            />
            {/* Profile */}
            <BottomNavItem
              id="bnav-org-profile"
              label="Profile"
              icon={<UserCircle className="w-5 h-5" />}
              active={organizerTab === 'profile'}
              onClick={onOrganizerProfile}
            />
            {/* Messages */}
            <BottomNavItem
              id="bnav-org-messages"
              label="Messages"
              icon={<MessageSquare className="w-5 h-5" />}
              badge={unreadMessages}
              onClick={onOpenChat}
            />
          </>
        ) : (
          <>
            {/* Dashboard */}
            <BottomNavItem
              id="bnav-mus-dashboard"
              label="Dashboard"
              icon={<Briefcase className="w-5 h-5" />}
              badge={unreadMessages}
              active={musicianTab === 'dashboard'}
              onClick={() => onMusicianTab('dashboard')}
            />
            {/* Social — browse musicians, chat, invite to a band/session */}
            <BottomNavItem
              id="bnav-mus-social"
              label="Social"
              icon={<UsersRound className="w-5 h-5" />}
              active={musicianTab === 'social'}
              onClick={() => onMusicianTab('social')}
            />
            {/* Find Gigs — FAB centre button */}
            <FindGigsFab
              active={musicianTab === 'find_gigs'}
              onClick={() => onMusicianTab('find_gigs')}
            />
            {/* Profile — editable profile + band/session management */}
            <BottomNavItem
              id="bnav-mus-band"
              label="Profile"
              icon={<UserCircle className="w-5 h-5" />}
              active={musicianTab === 'band'}
              onClick={() => onMusicianTab('band')}
            />
            {/* Messages */}
            <BottomNavItem
              id="bnav-mus-messages"
              label="Messages"
              icon={<MessageSquare className="w-5 h-5" />}
              badge={unreadMessages}
              onClick={onOpenChat}
            />
          </>
        )}
      </div>
    </nav>
  );
}

// ── Elevated circular FAB for "Post Gig" ────────────────────────────────────
function PostGigFab({ active, onClick }) {
  return (
    <div className="relative flex flex-col items-center justify-end pb-1 flex-1">
      {/* The elevated button lifts above the nav bar */}
      <button
        id="bnav-org-post"
        onClick={onClick}
        className={`
          relative -mt-5 w-14 h-14 rounded-full flex items-center justify-center
          shadow-xl transition-all cursor-pointer
          ring-4 ring-zinc-950
          ${active
            ? 'bg-fuchsia-500 shadow-fuchsia-500/40 scale-105'
            : 'bg-fuchsia-600 hover:bg-fuchsia-500 shadow-fuchsia-600/30 hover:scale-105 active:scale-95'
          }
        `}
        aria-label="Post a Gig"
      >
        {/* Glow ring */}
        <span className="absolute inset-0 rounded-full bg-fuchsia-500/20 blur-md pointer-events-none" />
        <Sparkles className="w-6 h-6 text-white relative z-10" />
      </button>
      <span className={`text-[10px] font-semibold tracking-tight mt-1 ${active ? 'text-fuchsia-400' : 'text-zinc-500'}`}>
        Post Gig
      </span>
    </div>
  );
}

// ── Elevated circular FAB for Find Gigs ─────────────────────────────────────
function FindGigsFab({ active, onClick }) {
  return (
    <div className="relative flex flex-col items-center justify-end pb-1 flex-1">
      <button
        id="bnav-mus-find"
        onClick={onClick}
        className={`
          relative -mt-5 w-14 h-14 rounded-full flex items-center justify-center
          shadow-xl transition-all cursor-pointer
          ring-4 ring-zinc-950
          ${active
            ? 'bg-violet-500 shadow-violet-500/40 scale-105'
            : 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/30 hover:scale-105 active:scale-95'
          }
        `}
        aria-label="Find Gigs"
      >
        <span className="absolute inset-0 rounded-full bg-violet-500/20 blur-md pointer-events-none" />
        <Compass className="w-6 h-6 text-white relative z-10" />
      </button>
      <span className={`text-[10px] font-semibold tracking-tight mt-1 ${active ? 'text-violet-400' : 'text-zinc-500'}`}>
        Find Gigs
      </span>
    </div>
  );
}

// ── Standard nav item ────────────────────────────────────────────────────────
function BottomNavItem({ id, label, icon, active, onClick, badge = 0 }) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center gap-0.5 flex-1
        min-h-[48px] px-1 py-1.5 rounded-xl transition-all cursor-pointer
        ${active ? 'text-violet-400' : 'text-zinc-500 hover:text-zinc-300'}
      `}
    >
      {/* Active pill indicator */}
      {active && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-violet-500 rounded-full" />
      )}

      {/* Icon with badge */}
      <span className="relative">
        {icon}
        {badge > 0 && (
          <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-violet-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-violet-600/30">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>

      {/* Label */}
      <span className={`text-[10px] font-semibold tracking-tight ${active ? 'text-violet-400' : 'text-zinc-500'}`}>
        {label}
      </span>
    </button>
  );
}
