import { Briefcase, Users, Compass, Sparkles, Store, MessageSquare } from 'lucide-react';

export default function BottomNav({
  role,
  organizerTab,
  musicianTab,
  unreadMessages,
  onOrganizerTab,
  onMusicianTab,
  onOpenChat,
}) {
  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
    >
      <div className="flex items-stretch justify-around px-2 pt-1.5 pb-1">
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
            {/* Post Gig */}
            <BottomNavItem
              id="bnav-org-post"
              label="Post Gig"
              icon={<Sparkles className="w-5 h-5" />}
              active={organizerTab === 'create_gig'}
              onClick={() => onOrganizerTab('create_gig')}
              accent
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
            {/* Find Gigs */}
            <BottomNavItem
              id="bnav-mus-find"
              label="Find Gigs"
              icon={<Compass className="w-5 h-5" />}
              active={musicianTab === 'find_gigs'}
              onClick={() => onMusicianTab('find_gigs')}
            />
            {/* Dashboard */}
            <BottomNavItem
              id="bnav-mus-dashboard"
              label="Dashboard"
              icon={<Users className="w-5 h-5" />}
              active={musicianTab === 'dashboard'}
              onClick={() => onMusicianTab('dashboard')}
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

function BottomNavItem({ id, label, icon, active, onClick, badge = 0, accent = false }) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center gap-0.5 flex-1
        min-h-[48px] px-1 py-1.5 rounded-xl transition-all cursor-pointer
        ${active
          ? 'text-violet-400'
          : accent
            ? 'text-fuchsia-400'
            : 'text-zinc-500 hover:text-zinc-300'
        }
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
