import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import GigCard from '../components/GigCard';
import MusicianCard from '../components/MusicianCard';
import StatusBadge from '../components/StatusBadge';
import { getGigs } from '../api/gigs';
import { getMusicians } from '../api/users';
import { createApplication } from '../api/applications';

function formatPHP(amount) {
  if (!amount) return '—';
  return `₱${Number(amount).toLocaleString()}`;
}
function formatDateLong(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PH', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

// ─── Feedback banner ─────────────────────────────────────────────────────────
function Feedback({ type, msg }) {
  if (!msg) return null;
  const styles = {
    success: 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400',
    error:   'bg-rose-500/5    border-rose-500/20    text-rose-400',
    info:    'bg-zinc-800      border-zinc-700        text-zinc-300',
  };
  const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };
  return (
    <div className={`rounded-xl p-4 text-sm border animate-slide-up ${styles[type] || styles.info}`}>
      {icons[type] || 'ℹ️'} {msg}
    </div>
  );
}

// ─── ORGANIZER: Artist Directory ──────────────────────────────────────────────
function OrganizerMarketplace() {
  const { currentUser } = useAuth();

  const [musicians, setMusicians]           = useState([]);
  const [selectedMusician, setSelectedMusician] = useState(null);
  const [myGigs, setMyGigs]                 = useState([]);
  const [loading, setLoading]               = useState(true);
  const [searchTerm, setSearchTerm]         = useState('');
  const [genreFilter, setGenreFilter]       = useState('');
  const [selectedGigId, setSelectedGigId]   = useState('');
  const [inviting, setInviting]             = useState(false);
  // track "gigId:musicianId" pairs already invited this session
  const [invited, setInvited]               = useState(new Set());
  const [feedback, setFeedback]             = useState({ type: '', msg: '' });

  useEffect(() => {
    async function load() {
      try {
        const [musiciansData, gigsData] = await Promise.all([
          getMusicians(),
          getGigs({ organizerId: currentUser._id }),
        ]);
        setMusicians(musiciansData);
        // Only open gigs are invite-able
        setMyGigs(gigsData.filter((g) => g.status === 'open'));
        if (musiciansData.length > 0) setSelectedMusician(musiciansData[0]);
      } catch { /* API offline */ }
      finally { setLoading(false); }
    }
    load();
  }, [currentUser._id]);

  const handleSelectMusician = (m) => {
    setSelectedMusician(m);
    setFeedback({ type: '', msg: '' });
    setSelectedGigId('');
  };

  const allGenres = [...new Set(musicians.flatMap((m) => m.genres || []))].sort();

  const filtered = musicians.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.bio || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchGenre = !genreFilter || (m.genres || []).includes(genreFilter);
    return matchSearch && matchGenre;
  });

  const handleInvite = async () => {
    if (!selectedGigId || !selectedMusician) return;
    const key = `${selectedGigId}:${selectedMusician._id}`;
    setInviting(true);
    setFeedback({ type: '', msg: '' });
    try {
      const gig = myGigs.find((g) => g._id === selectedGigId);
      await createApplication({
        gigId: selectedGigId,
        musicianId: selectedMusician._id,
        initiatedBy: 'organizer',
        message: `You've been personally invited to perform at "${gig?.title || 'our event'}"!`,
      });
      setInvited((prev) => new Set(prev).add(key));
      setFeedback({ type: 'success', msg: `Invitation sent to ${selectedMusician.name}!` });
    } catch (err) {
      if (err.message?.includes('Already applied')) {
        setInvited((prev) => new Set(prev).add(key));
        setFeedback({ type: 'info', msg: 'This artist has already applied to or been invited to that gig.' });
      } else {
        setFeedback({ type: 'error', msg: err.message || 'Failed to send invitation. Is the server running?' });
      }
    } finally {
      setInviting(false);
    }
  };

  const isInvited = selectedMusician && selectedGigId &&
    invited.has(`${selectedGigId}:${selectedMusician._id}`);

  // Avatar colour helper
  const avatarBg = (name = '') => {
    const colors = ['bg-violet-600','bg-indigo-600','bg-sky-600','bg-emerald-600','bg-amber-600','bg-rose-600'];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">🔍</span>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search by name, genre, or location…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="input sm:w-48"
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
        >
          <option value="">All Genres</option>
          {allGenres.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <div className="flex items-center gap-1.5 text-sm text-zinc-500 whitespace-nowrap self-center px-1">
          <span className="text-violet-400 font-semibold">{filtered.length}</span> artists
        </div>
      </div>

      {/* Split pane */}
      <div className="flex gap-5 h-[calc(100vh-310px)] min-h-[500px]">

        {/* Left — Musician list */}
        <div className="w-full lg:w-[360px] flex-shrink-0 overflow-y-auto space-y-2.5 pr-1">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card h-28 animate-pulse bg-zinc-800/50" />
            ))
          ) : filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-4xl mb-3">🎤</p>
              <p className="text-zinc-400 font-medium">No artists match your search.</p>
              <button className="btn-ghost text-sm mt-3" onClick={() => { setSearchTerm(''); setGenreFilter(''); }}>
                Clear filters
              </button>
            </div>
          ) : (
            filtered.map((m) => (
              <MusicianCard
                key={m._id}
                musician={m}
                isSelected={selectedMusician?._id === m._id}
                onClick={handleSelectMusician}
              />
            ))
          )}
        </div>

        {/* Right — Artist detail + invite panel */}
        <div className="hidden lg:flex flex-1 min-w-0">
          {selectedMusician ? (
            <div className="card flex-1 overflow-y-auto p-0 animate-fade-in flex flex-col">

              {/* Profile header */}
              <div className="px-7 py-6 border-b border-zinc-800 flex items-center gap-5 flex-shrink-0">
                <div className={`w-16 h-16 rounded-2xl ${avatarBg(selectedMusician.name)} flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}>
                  {selectedMusician.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-zinc-50">{selectedMusician.name}</h2>
                  {selectedMusician.location && (
                    <p className="text-sm text-zinc-500 mt-0.5">📍 {selectedMusician.location}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="tag-emerald text-xs">Musician</span>
                  </div>
                </div>
              </div>

              <div className="px-7 py-6 space-y-7 flex-1 overflow-y-auto">

                {/* Bio */}
                {selectedMusician.bio && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-2">About</p>
                    <p className="text-zinc-300 text-sm leading-relaxed">{selectedMusician.bio}</p>
                  </div>
                )}

                {/* Genres */}
                {selectedMusician.genres?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-2">Genres</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMusician.genres.map((g) => (
                        <span key={g} className="tag-violet">{g}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instruments */}
                {selectedMusician.instruments?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-2">Instruments</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMusician.instruments.map((i) => (
                        <span key={i} className="tag-sky">{i}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Invite to Gig ─────────────────────────────── */}
                <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-50">Send an Invitation</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Directly invite {selectedMusician.name.split(' ')[0]} to one of your open gigs.
                    </p>
                  </div>

                  {myGigs.length === 0 ? (
                    <div className="text-sm text-zinc-500 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                      You have no open gigs to invite to. <br />
                      <a href="/create-gig" className="text-violet-400 hover:underline mt-1 inline-block">Post a gig →</a>
                    </div>
                  ) : (
                    <>
                      <select
                        className="input"
                        value={selectedGigId}
                        onChange={(e) => { setSelectedGigId(e.target.value); setFeedback({ type: '', msg: '' }); }}
                      >
                        <option value="">— Select a gig —</option>
                        {myGigs.map((g) => (
                          <option key={g._id} value={g._id}>
                            {g.title} · {formatPHP(g.budget)}
                          </option>
                        ))}
                      </select>

                      <Feedback {...feedback} />

                      {isInvited ? (
                        <div className="w-full py-3 px-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-center text-sm">
                          ✓ Invitation Sent!
                        </div>
                      ) : (
                        <button
                          onClick={handleInvite}
                          disabled={inviting || !selectedGigId}
                          className="btn-primary w-full py-3"
                        >
                          {inviting ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Sending…
                            </span>
                          ) : '✉️ Send Invitation'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card flex-1 flex items-center justify-center text-center p-12">
              <div>
                <p className="text-5xl mb-4">🎤</p>
                <p className="text-zinc-500 font-medium">Select an artist to view their profile</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── MUSICIAN: Open Gigs ──────────────────────────────────────────────────────
function MusicianMarketplace() {
  const { currentUser } = useAuth();

  const [gigs, setGigs]                     = useState([]);
  const [selectedGig, setSelectedGig]       = useState(null);
  const [loading, setLoading]               = useState(true);
  const [searchTerm, setSearchTerm]         = useState('');
  const [genreFilter, setGenreFilter]       = useState('');
  const [applied, setApplied]               = useState(new Set());
  const [applying, setApplying]             = useState(false);
  const [feedback, setFeedback]             = useState({ type: '', msg: '' });

  useEffect(() => {
    async function load() {
      try {
        const data = await getGigs({ status: 'open' });
        setGigs(data);
        if (data.length > 0) setSelectedGig(data[0]);
      } catch { /* API offline */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const handleSelect = (gig) => { setSelectedGig(gig); setFeedback({ type: '', msg: '' }); };

  const allGenres = [...new Set(gigs.flatMap((g) => g.requirements?.genres || []))].sort();

  const filteredGigs = gigs.filter((g) => {
    const matchSearch =
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchGenre = !genreFilter || (g.requirements?.genres || []).includes(genreFilter);
    return matchSearch && matchGenre;
  });

  const handleApply = async () => {
    if (!selectedGig || !currentUser) return;
    setApplying(true);
    setFeedback({ type: '', msg: '' });
    try {
      await createApplication({
        gigId: selectedGig._id,
        musicianId: currentUser._id,
        initiatedBy: 'musician',
        message: `Hi! I'd love to perform at ${selectedGig.title}.`,
      });
      setApplied((prev) => new Set(prev).add(selectedGig._id));
      setFeedback({ type: 'success', msg: 'Application submitted! The organizer will be in touch.' });
    } catch (err) {
      if (err.message?.includes('Already applied')) {
        setApplied((prev) => new Set(prev).add(selectedGig._id));
        setFeedback({ type: 'info', msg: 'You have already applied to this gig.' });
      } else {
        setFeedback({ type: 'error', msg: err.message || 'Failed to apply. Is the server running?' });
      }
    } finally { setApplying(false); }
  };

  const hasApplied = selectedGig && applied.has(selectedGig._id);

  return (
    <div className="space-y-6">
      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">🔍</span>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search by title, venue, or city…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="input sm:w-48"
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
        >
          <option value="">All Genres</option>
          {allGenres.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <div className="flex items-center gap-1.5 text-sm text-zinc-500 whitespace-nowrap self-center px-1">
          <span className="text-violet-400 font-semibold">{filteredGigs.length}</span> gigs
        </div>
      </div>

      {/* Split pane */}
      <div className="flex gap-5 h-[calc(100vh-310px)] min-h-[500px]">

        {/* Left — Gig cards */}
        <div className="w-full lg:w-[380px] flex-shrink-0 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card h-40 animate-pulse bg-zinc-800/50" />
            ))
          ) : filteredGigs.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-4xl mb-3">🎵</p>
              <p className="text-zinc-400 font-medium">No gigs match your search.</p>
              <button className="btn-ghost text-sm mt-3" onClick={() => { setSearchTerm(''); setGenreFilter(''); }}>
                Clear filters
              </button>
            </div>
          ) : (
            filteredGigs.map((gig) => (
              <GigCard
                key={gig._id}
                gig={gig}
                isSelected={selectedGig?._id === gig._id}
                onClick={handleSelect}
              />
            ))
          )}
        </div>

        {/* Right — Gig detail */}
        <div className="hidden lg:flex flex-1 min-w-0">
          {selectedGig ? (
            <div className="card flex-1 overflow-y-auto p-0 animate-fade-in flex flex-col">
              {/* Detail header */}
              <div className="px-7 py-6 border-b border-zinc-800 flex-shrink-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2 className="text-2xl font-bold text-zinc-50 leading-tight">{selectedGig.title}</h2>
                  <StatusBadge status={selectedGig.status} />
                </div>
                <p className="text-zinc-500 text-sm">
                  📍 <span className="text-zinc-300 font-medium">{selectedGig.venue}</span>
                  {selectedGig.location && <span> · {selectedGig.location}</span>}
                </p>
              </div>

              <div className="px-7 py-6 space-y-7 flex-1 overflow-y-auto">
                {selectedGig.description && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-2">About</p>
                    <p className="text-zinc-300 text-sm leading-relaxed">{selectedGig.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                    <p className="text-xs text-zinc-600 uppercase tracking-wider font-medium mb-1">Date</p>
                    <p className="text-zinc-100 font-semibold text-sm">{formatDateLong(selectedGig.date)}</p>
                  </div>
                  <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                    <p className="text-xs text-zinc-600 uppercase tracking-wider font-medium mb-1">Talent Fee</p>
                    <p className="text-emerald-400 font-bold text-2xl tracking-tight">{formatPHP(selectedGig.budget)}</p>
                  </div>
                  {selectedGig.soundcheckTime && (
                    <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                      <p className="text-xs text-zinc-600 uppercase tracking-wider font-medium mb-1">Soundcheck</p>
                      <p className="text-zinc-100 font-semibold text-sm">{selectedGig.soundcheckTime}</p>
                    </div>
                  )}
                  {(selectedGig.startTime || selectedGig.endTime) && (
                    <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                      <p className="text-xs text-zinc-600 uppercase tracking-wider font-medium mb-1">Set Window</p>
                      <p className="text-zinc-100 font-semibold text-sm">
                        {selectedGig.startTime || '—'} – {selectedGig.endTime || '—'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  {selectedGig.requirements?.genres?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-2">Preferred Genres</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedGig.requirements.genres.map((g) => (
                          <span key={g} className="tag-violet">{g}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedGig.requirements?.instruments?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-2">Lineup Needed</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedGig.requirements.instruments.map((i) => (
                          <span key={i} className="tag-sky">{i}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className={`flex items-center gap-3 p-4 rounded-xl border ${
                    selectedGig.requirements?.backlineProvided
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-zinc-950 border-zinc-800'
                  }`}>
                    <span className="text-xl flex-shrink-0">
                      {selectedGig.requirements?.backlineProvided ? '✅' : '🎒'}
                    </span>
                    <div>
                      <p className="font-medium text-zinc-200 text-sm">Backline / Equipment</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {selectedGig.requirements?.backlineProvided
                          ? 'PA, amps, and gear provided by the venue'
                          : 'Musicians must bring their own equipment'}
                      </p>
                    </div>
                  </div>
                </div>

                <Feedback {...feedback} />

                <div className="pt-1 pb-2">
                  {hasApplied ? (
                    <div className="w-full py-3 px-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-center text-sm">
                      ✓ Applied — You're in the running!
                    </div>
                  ) : (
                    <button onClick={handleApply} disabled={applying} className="btn-primary w-full py-3 text-base">
                      {applying ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting…
                        </span>
                      ) : '🎤 Apply with Profile'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card flex-1 flex items-center justify-center text-center p-12">
              <div>
                <p className="text-5xl mb-4">🎸</p>
                <p className="text-zinc-500 font-medium">Select a gig to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page Shell ───────────────────────────────────────────────────────────────
export default function GigMarketplace() {
  const { isOrganizer } = useAuth();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">
          {isOrganizer ? 'Artist Directory' : 'Gig Marketplace'}
        </h1>
        <p className="text-zinc-400 mt-1">
          {isOrganizer
            ? 'Browse available musicians and bands — invite them directly to your open gigs.'
            : 'Browse open calls from event organizers across the Philippines.'}
        </p>
      </div>

      {isOrganizer ? <OrganizerMarketplace /> : <MusicianMarketplace />}
    </main>
  );
}
