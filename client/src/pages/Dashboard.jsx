import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { getGigs } from '../api/gigs';
import { getApplications } from '../api/applications';

function formatPHP(amount) {
  if (!amount) return '—';
  return `₱${Number(amount).toLocaleString()}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PH', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ─── Organizer View ───────────────────────────────────────────────────────────
function OrganizerDashboard({ userId }) {
  const [gigs, setGigs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [gigsData, appsData] = await Promise.all([
          getGigs({ organizerId: userId }),
          getApplications(),
        ]);
        setGigs(gigsData);
        const gigIds = new Set(gigsData.map((g) => g._id));
        setApplications(appsData.filter((a) => gigIds.has(a.gigId?._id || a.gigId)));
      } catch { /* API offline — graceful empty state */ }
      finally { setLoading(false); }
    }
    load();
  }, [userId]);

  const activeGigs      = gigs.filter((g) => g.status === 'open' || g.status === 'in_progress');
  const pendingApps     = applications.filter((a) => a.status === 'pending');
  const confirmedBooks  = applications.filter((a) => a.status === 'accepted');

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Active Gigs"           value={loading ? '…' : activeGigs.length}     icon="🎪" color="violet"  trend="Open for applications" />
        <MetricCard label="Pending Applications"  value={loading ? '…' : pendingApps.length}    icon="📋" color="amber"   trend="Awaiting your review" />
        <MetricCard label="Confirmed Bookings"    value={loading ? '…' : confirmedBooks.length} icon="✅" color="emerald" trend="Musicians locked in" />
      </div>

      {/* Upcoming Gigs table */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-800">
          <div>
            <h2 className="section-title">Your Upcoming Gigs</h2>
            <p className="section-subtitle">All events you've posted</p>
          </div>
          <Link to="/create-gig" className="btn-primary text-sm">
            + Post New Gig
          </Link>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-zinc-600">Loading gigs…</div>
        ) : gigs.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-4xl mb-3">🎸</p>
            <p className="text-zinc-400 font-medium">No gigs posted yet.</p>
            <Link to="/create-gig" className="btn-primary text-sm mt-4 inline-block">Post Your First Gig</Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {gigs.map((gig) => {
              const gigApps = applications.filter(
                (a) => (a.gigId?._id || a.gigId) === gig._id
              );
              return (
                <div key={gig._id} className="px-6 py-4 flex items-center gap-4 hover:bg-zinc-800/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-lg flex-shrink-0">
                    🎵
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-50 truncate">{gig.title}</p>
                    <p className="text-sm text-zinc-500 truncate">
                      {gig.venue} · {formatDate(gig.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm text-zinc-500 hidden sm:inline">
                      {gigApps.length} applicant{gigApps.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-base font-bold text-emerald-400">{formatPHP(gig.budget)}</span>
                    <StatusBadge status={gig.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Applications */}
      {applications.length > 0 && (
        <div className="card overflow-hidden p-0">
          <div className="px-6 py-5 border-b border-zinc-800">
            <h2 className="section-title">Recent Applications</h2>
            <p className="section-subtitle">Musicians who've applied to your gigs</p>
          </div>
          <div className="divide-y divide-zinc-800">
            {applications.slice(0, 6).map((app) => (
              <div key={app._id} className="px-6 py-4 flex items-center gap-4 hover:bg-zinc-800/40 transition-colors">
                <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {app.musicianId?.name?.charAt(0) || 'M'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-50">{app.musicianId?.name || 'Musician'}</p>
                  <p className="text-sm text-zinc-500 truncate">Applied for: {app.gigId?.title || 'a gig'}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Musician View ────────────────────────────────────────────────────────────
function MusicianDashboard({ userId }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getApplications({ musicianId: userId });
        setApplications(data);
      } catch { /* API offline */ }
      finally { setLoading(false); }
    }
    load();
  }, [userId]);

  const upcoming = applications.filter((a) => a.status === 'accepted');
  const pending  = applications.filter((a) => a.status === 'pending');
  const rejected = applications.filter((a) => a.status === 'rejected');

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Confirmed Gigs"       value={loading ? '…' : upcoming.length} icon="🎤" color="emerald" trend="Locked and booked" />
        <MetricCard label="Pending Applications" value={loading ? '…' : pending.length}  icon="⏳" color="amber"   trend="Awaiting organizer review" />
        <MetricCard label="Declined"             value={loading ? '…' : rejected.length} icon="✗"  color="rose"    trend="Keep applying!" />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/marketplace" className="card-hover p-6 flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
            🎸
          </div>
          <div>
            <p className="font-semibold text-zinc-50">Browse Gigs</p>
            <p className="text-sm text-zinc-500">Explore open opportunities</p>
          </div>
          <span className="ml-auto text-zinc-700 group-hover:text-violet-400 transition-colors text-lg">→</span>
        </Link>

        <div className="card p-6 flex items-center gap-4 opacity-50 cursor-not-allowed select-none">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl">
            📅
          </div>
          <div>
            <p className="font-semibold text-zinc-50">Availability Calendar</p>
            <p className="text-sm text-zinc-500">Coming in Phase 2</p>
          </div>
          <span className="ml-auto tag-zinc text-xs">Soon</span>
        </div>
      </div>

      {/* Application history */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-5 border-b border-zinc-800">
          <h2 className="section-title">My Applications</h2>
          <p className="section-subtitle">Track all your submitted applications</p>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-zinc-600">Loading applications…</div>
        ) : applications.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-4xl mb-3">🎵</p>
            <p className="text-zinc-400 font-medium">No applications yet.</p>
            <Link to="/marketplace" className="btn-primary text-sm mt-4 inline-block">Browse Open Gigs</Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {applications.map((app) => {
              const gig = app.gigId;
              return (
                <div key={app._id} className="px-6 py-4 flex items-center gap-4 hover:bg-zinc-800/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg flex-shrink-0">
                    🎪
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-50 truncate">{gig?.title || 'Gig'}</p>
                    <p className="text-sm text-zinc-500 truncate">
                      {gig?.venue} · {formatDate(gig?.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {gig?.budget && (
                      <span className="font-bold text-emerald-400 text-sm">{formatPHP(gig.budget)}</span>
                    )}
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { currentUser, isOrganizer } = useAuth();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">
          Mabuhay,{' '}
          <span className="text-violet-400">{currentUser?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-zinc-400 mt-1">
          {isOrganizer
            ? 'Pamahalaan ang inyong mga events at suriin ang mga aplikante.'
            : 'Subaybayan ang inyong mga gig opportunities at application statuses.'}
        </p>
      </div>

      {isOrganizer
        ? <OrganizerDashboard userId={currentUser._id} />
        : <MusicianDashboard  userId={currentUser._id} />
      }
    </main>
  );
}
