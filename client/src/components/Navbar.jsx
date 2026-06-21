import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: '⊞' },
  { to: '/create-gig', label: 'Post a Gig', icon: '+', organizerOnly: true },
  { to: '/marketplace', label: 'Marketplace', icon: '♪' },
];

export default function Navbar() {
  const { currentUser, toggleRole, isOrganizer } = useAuth();
  const location = useLocation();

  const visibleLinks = NAV_LINKS.filter((l) => !l.organizerOnly || isOrganizer);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-600/30 group-hover:bg-violet-500 transition-colors duration-200">
              G
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-50">
              Gig<span className="text-violet-400">Buddy</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-0.5">
            {visibleLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80'
                  }`}
                >
                  <span className="text-xs opacity-70">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right — role toggle + user */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleRole}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-all duration-150 text-sm"
              title="Switch role (Phase 1 dev only)"
            >
              <span className="text-zinc-500 text-xs hidden sm:inline">Switch to</span>
              <span className={`font-medium text-xs px-2 py-0.5 rounded-full ${
                isOrganizer
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {isOrganizer ? 'Musician' : 'Organizer'}
              </span>
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-semibold">
                {currentUser?.name?.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-zinc-50 leading-tight">{currentUser?.name}</p>
                <p className={`text-xs font-medium ${isOrganizer ? 'text-sky-400' : 'text-emerald-400'}`}>
                  {isOrganizer ? 'Organizer' : 'Musician'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
