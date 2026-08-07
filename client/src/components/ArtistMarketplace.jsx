import { useState, useMemo, useEffect, useRef } from 'react';
import { getTeam } from '../api/teams.js';
import PremiumBadge from './PremiumBadge.jsx';
import RatingBadge from './RatingBadge.jsx';
import { findConflictingContract } from '../utils/booking.js';
import {
  Search,
  ListFilter,
  MapPin,
  Music,
  Star,
  Send,
  Check,
  ChevronRight,
  Mic,
  Drum,
  Guitar,
  UserCheck,
  BadgeCheck,
  X,
  MessageSquare,
  Users,
  AlertTriangle,
} from 'lucide-react';

// Instrument icon helper
function InstrumentIcon({ name }) {
  const n = (name || '').toLowerCase();
  if (n.includes('guitar') || n.includes('bass')) return <Guitar className="w-3.5 h-3.5" />;
  if (n.includes('drum') || n.includes('percussion')) return <Drum className="w-3.5 h-3.5" />;
  if (n.includes('vocal') || n.includes('singer')) return <Mic className="w-3.5 h-3.5" />;
  return <Music className="w-3.5 h-3.5" />;
}

// Invite Modal — lets planner pick a gig and write a note
function InviteModal({ musician, openGigs, existingApplications, onSend, onClose, contracts = [], gigsById = {}, conflictMusicianId }) {
  const [selectedGigId, setSelectedGigId] = useState(openGigs[0]?._id || openGigs[0]?.id || '');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const alreadyInvited = (gigId) =>
    existingApplications.some(
      (a) => (a.gigId?._id || a.gigId) === gigId &&
              (a.musicianId?._id || a.musicianId) === (musician._id || musician.id)
    );

  const conflictFor = (gig) =>
    conflictMusicianId ? findConflictingContract(gig, conflictMusicianId, contracts, gigsById) : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedGigId) { setError('Please select a gig.'); return; }
    if (alreadyInvited(selectedGigId)) {
      setError('You have already sent an invite for this gig to this artist.'); return;
    }
    const selectedGig = openGigs.find((g) => (g._id || g.id) === selectedGigId);
    if (selectedGig && conflictFor(selectedGig)) {
      setError("This artist already has a booking that overlaps this gig's time slot."); return;
    }
    setError('');
    onSend(selectedGigId, note);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full sm:max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              referrerPolicy="no-referrer"
              src={musician.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(musician.name)}&background=7c3aed&color=fff&size=80`}
              alt={musician.name}
              className="w-10 h-10 rounded-xl object-cover border border-zinc-700"
            />
            <div>
              <h3 className="font-bold text-zinc-50 text-base">Invite {musician.name}</h3>
              <p className="text-xs text-violet-400">{(musician.instruments || [])[0] || 'Musician'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-50 p-1.5 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Gig Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Select Gig to Invite For
            </label>
            {openGigs.length === 0 ? (
              <p className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg">
                You have no open gigs right now. Publish one first from the "Publish Open Gig Call" tab.
              </p>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {openGigs.map((gig) => {
                  const gigId = gig._id || gig.id;
                  const invited = alreadyInvited(gigId);
                  const conflict = !invited ? conflictFor(gig) : null;
                  const blocked = invited || !!conflict;
                  return (
                    <label
                      key={gigId}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedGigId === gigId
                          ? 'border-violet-500/70 bg-violet-600/5'
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950'
                      } ${blocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="gig-select"
                        value={gigId}
                        checked={selectedGigId === gigId}
                        onChange={() => !blocked && setSelectedGigId(gigId)}
                        disabled={blocked}
                        className="mt-0.5 accent-violet-600 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-100 truncate">{gig.title}</p>
                        <p className="text-[10px] font-mono text-zinc-500 truncate">{gig.venueName} · ₱{gig.budget?.toLocaleString()}</p>
                        {invited && (
                          <span className="text-[9px] text-emerald-400 font-mono uppercase">✓ Already Invited</span>
                        )}
                        {conflict && (
                          <span className="text-[9px] text-amber-400 font-mono uppercase flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> Time Conflict — booked for "{conflict.gigTitle}"
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Personal Note */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Personal Note (optional)
            </label>
            <textarea
              id="invite-note-input"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={`Hi ${musician.name?.split(' ')[0]}, we'd love to have you for this gig! Your profile stood out to us...`}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-violet-500 placeholder:text-zinc-600 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg py-2.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="send-invite-btn"
              type="submit"
              disabled={openGigs.length === 0}
              className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-50 rounded-lg py-2.5 text-xs font-semibold shadow-lg shadow-violet-600/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Send Direct Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ArtistMarketplace({
  musicians,
  teams = [],
  gigs,
  applications,
  contracts = [],
  onInvite,
  onInviteTeam,
  onOpenInviteChat,
  initialFocusMusicianId,
}) {
  const [viewMode, setViewMode] = useState('solo'); // 'solo' | 'bands'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedArtistId, setSelectedArtistId] = useState(
    musicians[0]?._id || musicians[0]?.id || ''
  );
  // On mobile, the detail panel becomes a centered modal that only opens on
  // an explicit tap — selectedArtistId alone defaults to the first musician,
  // which would otherwise pop the modal open unprompted on page load.
  const [showMobileArtistDetail, setShowMobileArtistDetail] = useState(false);

  // Deep-link support: auto-select a musician when arriving via a "View
  // Profile" recommendation link. Guarded so it only fires once per id.
  const consumedFocusRef = useRef(null);
  useEffect(() => {
    if (initialFocusMusicianId && consumedFocusRef.current !== initialFocusMusicianId) {
      consumedFocusRef.current = initialFocusMusicianId;
      setViewMode('solo');
      setSelectedArtistId(initialFocusMusicianId);
      setShowMobileArtistDetail(true);
    }
  }, [initialFocusMusicianId]);
  const [inviteTarget, setInviteTarget] = useState(null); // musician being invited
  const [successIds, setSuccessIds] = useState(new Set()); // musician IDs that got invited
  // Map: musicianId → conversationId returned from the invite
  const [inviteConvoMap, setInviteConvoMap] = useState({});

  // ── Bands mode ──────────────────────────────────────────────────────────
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?._id || teams[0]?.id || '');
  const [showMobileTeamDetail, setShowMobileTeamDetail] = useState(false);
  const [teamInviteTarget, setTeamInviteTarget] = useState(null); // team being invited
  const [successTeamIds, setSuccessTeamIds] = useState(new Set());
  const [teamInviteConvoMap, setTeamInviteConvoMap] = useState({});
  // GET /api/teams (list) omits roster for efficiency — fetch it separately
  // via GET /api/teams/:id whenever the selection changes in Bands mode.
  const [teamRoster, setTeamRoster] = useState([]);
  // Tapping a roster member pops up their individual profile on top of the
  // band modal — id-only, resolved against the full `musicians` list below
  // so it gets bio/rating/etc. that the roster's populate() doesn't include.
  const [rosterMemberId, setRosterMemberId] = useState(null);

  useEffect(() => {
    if (viewMode !== 'bands' || !selectedTeamId) {
      setTeamRoster([]);
      return;
    }
    let cancelled = false;
    getTeam(selectedTeamId)
      .then((detail) => { if (!cancelled) setTeamRoster(detail.roster || []); })
      .catch(() => { if (!cancelled) setTeamRoster([]); });
    return () => { cancelled = true; };
  }, [viewMode, selectedTeamId]);

  // Build filter options
  const allInstruments = useMemo(() => {
    const set = new Set();
    musicians.forEach((m) => (m.instruments || []).forEach((i) => set.add(i)));
    return ['All', ...Array.from(set)];
  }, [musicians]);

  const allGenres = useMemo(() => {
    const set = new Set();
    musicians.forEach((m) => (m.genres || []).forEach((g) => set.add(g)));
    return ['All', ...Array.from(set)];
  }, [musicians]);

  // Filtered list
  const filteredMusicians = useMemo(() => {
    return musicians.filter((m) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        m.name?.toLowerCase().includes(q) ||
        m.bio?.toLowerCase().includes(q) ||
        m.location?.toLowerCase().includes(q) ||
        (m.instruments || []).some((i) => i.toLowerCase().includes(q)) ||
        (m.genres || []).some((g) => g.toLowerCase().includes(q));
      const matchesInstrument =
        selectedInstrument === 'All' || (m.instruments || []).includes(selectedInstrument);
      const matchesGenre =
        selectedGenre === 'All' || (m.genres || []).includes(selectedGenre);
      return matchesSearch && matchesInstrument && matchesGenre;
    });
  }, [musicians, searchQuery, selectedInstrument, selectedGenre]);

  const selectedArtist = musicians.find(
    (m) => (m._id || m.id) === selectedArtistId
  ) || musicians[0];

  const rosterMemberProfile = rosterMemberId
    ? musicians.find((m) => (m._id || m.id)?.toString() === rosterMemberId)
    : null;

  // Bands filter — same search semantics as solo artists, genre only (no
  // instrument filter since a team's combined instrumentation isn't loaded
  // in the list view, only on the single-team detail fetch)
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        t.name?.toLowerCase().includes(q) ||
        t.bio?.toLowerCase().includes(q) ||
        t.location?.toLowerCase().includes(q) ||
        (t.genres || []).some((g) => g.toLowerCase().includes(q));
      const matchesGenre = selectedGenre === 'All' || (t.genres || []).includes(selectedGenre);
      return matchesSearch && matchesGenre;
    });
  }, [teams, searchQuery, selectedGenre]);

  const selectedTeam = teams.find(
    (t) => (t._id || t.id) === selectedTeamId
  ) || teams[0];

  const openGigs = gigs.filter((g) => g.status === 'open');

  const gigsById = {};
  gigs.forEach((g) => { gigsById[(g._id || g.id)?.toString()] = g; });

  // How many gigs has this artist been invited to
  const inviteCount = (musicianId) =>
    applications.filter(
      (a) => (a.musicianId?._id || a.musicianId) === musicianId && a.initiatedBy === 'organizer'
    ).length;

  const handleSendInvite = async (gigId, note) => {
    if (!inviteTarget) return;
    const musicianId = inviteTarget._id || inviteTarget.id;
    const result = await onInvite(gigId, inviteTarget, note);
    setSuccessIds((prev) => new Set(prev).add(musicianId));
    // Store the conversationId if the server returned one
    if (result?.conversationId) {
      setInviteConvoMap((prev) => ({ ...prev, [musicianId]: result.conversationId }));
    }
    setInviteTarget(null);
  };

  const handleSendTeamInvite = async (gigId, note) => {
    if (!teamInviteTarget) return;
    const teamId = teamInviteTarget._id || teamInviteTarget.id;
    const result = await onInviteTeam(gigId, teamInviteTarget, note);
    setSuccessTeamIds((prev) => new Set(prev).add(teamId));
    if (result?.conversationId) {
      setTeamInviteConvoMap((prev) => ({ ...prev, [teamId]: result.conversationId }));
    }
    setTeamInviteTarget(null);
  };

  return (
    <div id="artist-marketplace-container" className="space-y-4">
      {/* Solo / Bands toggle */}
      <div id="artist-view-toggle" className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 gap-1.5 w-full sm:w-fit">
        <button
          id="view-toggle-solo"
          onClick={() => setViewMode('solo')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            viewMode === 'solo' ? 'bg-violet-600 text-zinc-50' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" /> Solo Artists
        </button>
        <button
          id="view-toggle-bands"
          onClick={() => setViewMode('bands')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            viewMode === 'bands' ? 'bg-violet-600 text-zinc-50' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Bands
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              id="search-artist-input"
              type="text"
              placeholder={viewMode === 'solo' ? 'Search by name, instrument, genre...' : 'Search by band name, genre...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
            <UserCheck className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-zinc-300 font-semibold">
              {viewMode === 'solo' ? filteredMusicians.length : filteredTeams.length}
            </span>
            <span>{viewMode === 'solo' ? 'verified artist' : 'band'}{(viewMode === 'solo' ? filteredMusicians.length : filteredTeams.length) !== 1 ? 's' : ''} available</span>
          </div>
        </div>

        {/* Filter rows */}
        <div className="space-y-2">
          {viewMode === 'solo' && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <ListFilter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider w-16 shrink-0">Instrument</span>
            {allInstruments.slice(0, 10).map((inst) => (
              <button
                key={inst}
                id={`filter-inst-${inst}`}
                onClick={() => setSelectedInstrument(inst)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  selectedInstrument === inst
                    ? 'bg-violet-600 text-zinc-50'
                    : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {inst}
              </button>
            ))}
          </div>
          )}

          <div className="flex items-center gap-1.5 flex-wrap">
            <ListFilter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider w-16 shrink-0">Genre</span>
            {allGenres.slice(0, 10).map((genre) => (
              <button
                key={genre}
                id={`filter-genre-artist-${genre}`}
                onClick={() => setSelectedGenre(genre)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  selectedGenre === genre
                    ? 'bg-fuchsia-700 text-zinc-50'
                    : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === 'solo' ? (
      <>
      {/* Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Artist Cards */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
          {filteredMusicians.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-400 text-sm">
              No artists match your filters.
            </div>
          ) : (
            filteredMusicians.map((m) => {
              const mId = m._id || m.id;
              const active = selectedArtistId === mId;
              const invited = successIds.has(mId);
              const invites = inviteCount(mId);

              return (
                <div
                  id={`artist-card-${mId}`}
                  key={mId}
                  onClick={() => { setSelectedArtistId(mId); setShowMobileArtistDetail(true); }}
                  className={`border rounded-xl p-4 cursor-pointer transition-all relative overflow-hidden ${
                    active
                      ? 'bg-zinc-900 border-violet-500/80 shadow-md shadow-violet-600/5'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      <img
                        referrerPolicy="no-referrer"
                        src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=7c3aed&color=fff&size=80`}
                        alt={m.name}
                        className="w-12 h-12 rounded-xl object-cover border border-zinc-800"
                      />
                      {invited && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-zinc-50 text-sm truncate">{m.name}</h4>
                        {m.genres?.length > 0 && (
                          <BadgeCheck className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        )}
                        {m.isPremium && <PremiumBadge compact />}
                      </div>
                      <p className="text-[11px] text-violet-400 font-medium flex items-center gap-1 mt-0.5">
                        <InstrumentIcon name={(m.instruments || [])[0]} />
                        <span className="truncate">{(m.instruments || []).join(', ') || 'Musician'}</span>
                      </p>
                      {m.location && (
                        <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1 font-mono">
                          <MapPin className="w-3 h-3" />
                          <span>{m.location}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <RatingBadge rating={m.rating} count={m.ratingCount} />
                      {invites > 0 && (
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded">
                          {invites} invite{invites > 1 ? 's' : ''} sent
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 transition-colors ${active ? 'text-violet-400' : 'text-zinc-600'}`} />
                    </div>
                  </div>

                  {/* Genre tags */}
                  {(m.genres || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-zinc-800/60">
                      {m.genres.slice(0, 4).map((g) => (
                        <span key={g} className="px-1.5 py-0.5 bg-zinc-950 text-[9px] font-mono text-zinc-400 rounded">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right: Artist Profile Detail — centered modal on mobile, static
            panel on desktop (lg+) so it never appears stacked at the bottom */}
        <div
          className={`${showMobileArtistDetail && selectedArtist ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm' : 'hidden'} lg:flex lg:static lg:inset-auto lg:z-auto lg:p-0 lg:bg-transparent lg:backdrop-blur-none lg:col-span-7`}
          onClick={(e) => { if (e.target === e.currentTarget) setShowMobileArtistDetail(false); }}
        >
        <div className="relative w-full max-h-[85vh] overflow-y-auto lg:max-h-none lg:overflow-visible lg:w-full bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden flex flex-col">
          {/* Mobile-only close button */}
          <button
            id="close-artist-detail-mobile"
            type="button"
            onClick={() => setShowMobileArtistDetail(false)}
            className="lg:hidden absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-400 hover:text-zinc-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          {!selectedArtist ? (
            <div className="min-h-[200px] lg:h-[620px] flex items-center justify-center text-zinc-500 text-sm">
              Select an artist to view their profile
            </div>
          ) : (
            <>
              {/* Hero */}
              <div className="relative bg-gradient-to-br from-violet-600/10 via-zinc-900 to-fuchsia-900/10 border-b border-zinc-800 p-6">
                <div className="flex items-start gap-5">
                  <img
                    referrerPolicy="no-referrer"
                    src={selectedArtist.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedArtist.name)}&background=7c3aed&color=fff&size=160`}
                    alt={selectedArtist.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-violet-500/30 shadow-xl shadow-violet-600/10 shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-extrabold text-zinc-50 text-2xl tracking-tight">
                          {selectedArtist.name}
                        </h2>
                        <span className="px-2 py-0.5 bg-violet-600/20 text-violet-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-violet-500/20">
                          Verified Artist
                        </span>
                        <RatingBadge rating={selectedArtist.rating} count={selectedArtist.ratingCount} size="lg" />
                      </div>
                      <p className="text-sm text-violet-300 font-medium mt-0.5 flex items-center gap-1.5">
                        <InstrumentIcon name={(selectedArtist.instruments || [])[0]} />
                        {(selectedArtist.instruments || []).join(' · ') || 'Musician'}
                      </p>
                    </div>
                    {selectedArtist.location && (
                      <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        {selectedArtist.location}
                      </p>
                    )}
                    <div className="flex items-center gap-3 pt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
                      ))}
                      <span className="text-xs text-zinc-400 font-mono">4.8 · Verified Pro</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details — scrollable, fills available height */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Bio */}
                {selectedArtist.bio && (
                  <div>
                    <h5 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Artist Bio</h5>
                    <p className="text-xs text-zinc-300 leading-relaxed italic bg-zinc-950/40 p-3.5 rounded-lg border border-zinc-800">
                      "{selectedArtist.bio}"
                    </p>
                  </div>
                )}

                {/* Instruments */}
                {(selectedArtist.instruments || []).length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Instruments</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedArtist.instruments.map((inst) => (
                        <span key={inst} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/10 text-violet-300 border border-violet-500/20 rounded-lg text-xs font-medium">
                          <InstrumentIcon name={inst} />
                          {inst}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Genres */}
                {(selectedArtist.genres || []).length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Genre Expertise</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedArtist.genres.map((g) => (
                        <span key={g} className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded text-xs font-semibold uppercase tracking-wide">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past activity on platform */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Gigs Done', val: '12', color: 'text-emerald-400' },
                    { label: 'Avg Response', val: '< 2h', color: 'text-violet-400' },
                    { label: 'Cancellations', val: '0', color: 'text-zinc-300' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-center">
                      <span className={`text-lg font-extrabold font-mono block ${color}`}>{val}</span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA — always visible at the bottom, never overlapping */}
              <div className="px-6 pb-6 pt-4 border-t border-zinc-800 bg-zinc-900 shrink-0">
                {successIds.has(selectedArtist._id || selectedArtist.id) ? (
                  <div className="space-y-2">
                    <div className="w-full bg-emerald-500/10 border border-emerald-500/15 p-3 rounded-xl text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      Invitation Sent!
                    </div>
                    {inviteConvoMap[selectedArtist._id || selectedArtist.id] && onOpenInviteChat && (
                      <button
                        id={`open-chat-${selectedArtist._id || selectedArtist.id}`}
                        onClick={() => onOpenInviteChat(inviteConvoMap[selectedArtist._id || selectedArtist.id])}
                        className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold rounded-xl py-2.5 text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4 text-violet-400" />
                        Open Chat with {selectedArtist.name?.split(' ')[0]}
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    id={`invite-artist-${selectedArtist._id || selectedArtist.id}`}
                    onClick={() => setInviteTarget(selectedArtist)}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-zinc-50 font-semibold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-violet-600/20 hover:scale-[1.01] active:scale-[0.99] transform cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Invite {selectedArtist.name?.split(' ')[0]} to a Gig
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        </div>
      </div>
      </>
      ) : (
      <>
      {/* Split Pane — Bands */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Band Cards */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
          {filteredTeams.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-400 text-sm">
              No bands match your filters.
            </div>
          ) : (
            filteredTeams.map((t) => {
              const tId = t._id || t.id;
              const active = selectedTeamId === tId;
              const invited = successTeamIds.has(tId);

              return (
                <div
                  id={`team-card-${tId}`}
                  key={tId}
                  onClick={() => { setSelectedTeamId(tId); setShowMobileTeamDetail(true); }}
                  className={`border rounded-xl p-4 cursor-pointer transition-all relative overflow-hidden ${
                    active
                      ? 'bg-zinc-900 border-violet-500/80 shadow-md shadow-violet-600/5'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      <img
                        referrerPolicy="no-referrer"
                        src={t.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=7c3aed&color=fff&size=80`}
                        alt={t.name}
                        className="w-12 h-12 rounded-xl object-cover border border-zinc-800"
                      />
                      {invited && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-zinc-50 text-sm truncate">{t.name}</h4>
                        <BadgeCheck className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      </div>
                      <p className="text-[11px] text-violet-400 font-medium flex items-center gap-1 mt-0.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>Band</span>
                      </p>
                      {t.location && (
                        <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1 font-mono">
                          <MapPin className="w-3 h-3" />
                          <span>{t.location}</span>
                        </p>
                      )}
                    </div>

                    <ChevronRight className={`w-4 h-4 transition-colors shrink-0 ${active ? 'text-violet-400' : 'text-zinc-600'}`} />
                  </div>

                  {(t.genres || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-zinc-800/60">
                      {t.genres.slice(0, 4).map((g) => (
                        <span key={g} className="px-1.5 py-0.5 bg-zinc-950 text-[9px] font-mono text-zinc-400 rounded">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right: Band Profile Detail — centered modal on mobile, static
            panel on desktop (lg+) so it never appears stacked at the bottom */}
        <div
          className={`${showMobileTeamDetail && selectedTeam ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm' : 'hidden'} lg:flex lg:static lg:inset-auto lg:z-auto lg:p-0 lg:bg-transparent lg:backdrop-blur-none lg:col-span-7`}
          onClick={(e) => { if (e.target === e.currentTarget) setShowMobileTeamDetail(false); }}
        >
        <div className="relative w-full max-h-[85vh] overflow-y-auto lg:max-h-none lg:overflow-visible lg:w-full bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden flex flex-col">
          {/* Mobile-only close button */}
          <button
            id="close-team-detail-mobile"
            type="button"
            onClick={() => setShowMobileTeamDetail(false)}
            className="lg:hidden absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-400 hover:text-zinc-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          {!selectedTeam ? (
            <div className="min-h-[200px] lg:h-[620px] flex items-center justify-center text-zinc-500 text-sm">
              Select a band to view their profile
            </div>
          ) : (
            <>
              {/* Hero */}
              <div className="relative bg-gradient-to-br from-violet-600/10 via-zinc-900 to-fuchsia-900/10 border-b border-zinc-800 p-6">
                <div className="flex items-start gap-5">
                  <img
                    referrerPolicy="no-referrer"
                    src={selectedTeam.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTeam.name)}&background=7c3aed&color=fff&size=160`}
                    alt={selectedTeam.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-violet-500/30 shadow-xl shadow-violet-600/10 shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-extrabold text-zinc-50 text-2xl tracking-tight">
                          {selectedTeam.name}
                        </h2>
                        <span className="px-2 py-0.5 bg-violet-600/20 text-violet-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-violet-500/20">
                          Band
                        </span>
                      </div>
                    </div>
                    {selectedTeam.location && (
                      <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        {selectedTeam.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {selectedTeam.bio && (
                  <div>
                    <h5 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">About the Band</h5>
                    <p className="text-xs text-zinc-300 leading-relaxed italic bg-zinc-950/40 p-3.5 rounded-lg border border-zinc-800">
                      "{selectedTeam.bio}"
                    </p>
                  </div>
                )}

                {(selectedTeam.genres || []).length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Genre Expertise</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTeam.genres.map((g) => (
                        <span key={g} className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded text-xs font-semibold uppercase tracking-wide">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {teamRoster.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Roster</h5>
                    <div className="space-y-1.5">
                      {teamRoster.map((member) => (
                        <div
                          key={member._id || member.id}
                          onClick={() => setRosterMemberId((member.musicianId?._id || member.musicianId)?.toString())}
                          className="flex items-center gap-2.5 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 cursor-pointer hover:border-zinc-700 transition-colors"
                        >
                          <img
                            referrerPolicy="no-referrer"
                            src={member.musicianId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.musicianId?.name || '?')}&background=27272a&color=fff&size=40`}
                            alt={member.musicianId?.name}
                            className="w-7 h-7 rounded-lg object-cover border border-zinc-800 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-zinc-200 truncate">{member.musicianId?.name}</p>
                            <p className="text-[10px] text-zinc-500 truncate">{member.instrument || (member.musicianId?.instruments || [])[0] || 'Member'}</p>
                          </div>
                          {member.role === 'manager' && (
                            <span className="text-[9px] font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded uppercase shrink-0">
                              Manager
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="px-6 pb-6 pt-4 border-t border-zinc-800 bg-zinc-900 shrink-0">
                {successTeamIds.has(selectedTeam._id || selectedTeam.id) ? (
                  <div className="space-y-2">
                    <div className="w-full bg-emerald-500/10 border border-emerald-500/15 p-3 rounded-xl text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      Invitation Sent!
                    </div>
                    {teamInviteConvoMap[selectedTeam._id || selectedTeam.id] && onOpenInviteChat && (
                      <button
                        id={`open-team-chat-${selectedTeam._id || selectedTeam.id}`}
                        onClick={() => onOpenInviteChat(teamInviteConvoMap[selectedTeam._id || selectedTeam.id])}
                        className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold rounded-xl py-2.5 text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4 text-violet-400" />
                        Open Chat with {selectedTeam.name}
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    id={`invite-team-${selectedTeam._id || selectedTeam.id}`}
                    onClick={() => setTeamInviteTarget(selectedTeam)}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-zinc-50 font-semibold rounded-xl py-3.5 text-sm transition-all shadow-lg shadow-violet-600/20 hover:scale-[1.01] active:scale-[0.99] transform cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Invite {selectedTeam.name} to a Gig
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        </div>
      </div>

      {/* Invite Modal — musician invite, used by the solo-artist detail AND
          the roster-member profile popup below, so it lives at the root
          instead of nested inside the 'solo' viewMode branch */}
      {inviteTarget && (
        <InviteModal
          musician={inviteTarget}
          openGigs={openGigs}
          existingApplications={applications}
          onSend={handleSendInvite}
          onClose={() => setInviteTarget(null)}
          contracts={contracts}
          gigsById={gigsById}
          conflictMusicianId={inviteTarget._id || inviteTarget.id}
        />
      )}

      {/* Team Invite Modal — reuses InviteModal, tagged as a Band instead of a Musician */}
      {teamInviteTarget && (
        <InviteModal
          musician={{ ...teamInviteTarget, instruments: ['Band'] }}
          openGigs={openGigs}
          existingApplications={applications}
          onSend={handleSendTeamInvite}
          onClose={() => setTeamInviteTarget(null)}
          contracts={contracts}
          gigsById={gigsById}
          conflictMusicianId={teamInviteTarget.defaultPayoutManagerId?._id || teamInviteTarget.defaultPayoutManagerId}
        />
      )}

      {/* Roster Member Profile — pops up on top of the band modal when a
          roster row is tapped, on every screen size (there's no split-pane
          slot to fall back to while the band detail is already occupying it) */}
      {rosterMemberProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setRosterMemberId(null); }}
        >
          <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl">
            <button
              id="close-roster-member-profile"
              type="button"
              onClick={() => setRosterMemberId(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-400 hover:text-zinc-50 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Hero */}
            <div className="relative bg-gradient-to-br from-violet-600/10 via-zinc-900 to-fuchsia-900/10 border-b border-zinc-800 p-6">
              <div className="flex items-start gap-4">
                <img
                  referrerPolicy="no-referrer"
                  src={rosterMemberProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rosterMemberProfile.name)}&background=7c3aed&color=fff&size=160`}
                  alt={rosterMemberProfile.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-violet-500/30 shadow-xl shadow-violet-600/10 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-extrabold text-zinc-50 text-xl tracking-tight">{rosterMemberProfile.name}</h2>
                    <RatingBadge rating={rosterMemberProfile.rating} count={rosterMemberProfile.ratingCount} />
                  </div>
                  <p className="text-sm text-violet-300 font-medium flex items-center gap-1.5">
                    <InstrumentIcon name={(rosterMemberProfile.instruments || [])[0]} />
                    {(rosterMemberProfile.instruments || []).join(' · ') || 'Musician'}
                  </p>
                  {rosterMemberProfile.location && (
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      {rosterMemberProfile.location}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="p-6 space-y-5">
              {rosterMemberProfile.bio && (
                <div>
                  <h5 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Artist Bio</h5>
                  <p className="text-xs text-zinc-300 leading-relaxed italic bg-zinc-950/40 p-3.5 rounded-lg border border-zinc-800">
                    "{rosterMemberProfile.bio}"
                  </p>
                </div>
              )}

              {(rosterMemberProfile.instruments || []).length > 0 && (
                <div>
                  <h5 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Instruments</h5>
                  <div className="flex flex-wrap gap-2">
                    {rosterMemberProfile.instruments.map((inst) => (
                      <span key={inst} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/10 text-violet-300 border border-violet-500/20 rounded-lg text-xs font-medium">
                        <InstrumentIcon name={inst} />
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(rosterMemberProfile.genres || []).length > 0 && (
                <div>
                  <h5 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Genre Expertise</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {rosterMemberProfile.genres.map((g) => (
                      <span key={g} className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded text-xs font-semibold uppercase tracking-wide">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="px-6 pb-6 pt-4 border-t border-zinc-800 bg-zinc-900">
              {successIds.has(rosterMemberProfile._id || rosterMemberProfile.id) ? (
                <div className="space-y-2">
                  <div className="w-full bg-emerald-500/10 border border-emerald-500/15 p-3 rounded-xl text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    Invitation Sent!
                  </div>
                  {inviteConvoMap[rosterMemberProfile._id || rosterMemberProfile.id] && onOpenInviteChat && (
                    <button
                      id={`open-chat-roster-${rosterMemberProfile._id || rosterMemberProfile.id}`}
                      onClick={() => onOpenInviteChat(inviteConvoMap[rosterMemberProfile._id || rosterMemberProfile.id])}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold rounded-xl py-2.5 text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4 text-violet-400" />
                      Open Chat with {rosterMemberProfile.name?.split(' ')[0]}
                    </button>
                  )}
                </div>
              ) : (
                <button
                  id={`invite-roster-member-${rosterMemberProfile._id || rosterMemberProfile.id}`}
                  onClick={() => { setInviteTarget(rosterMemberProfile); setRosterMemberId(null); }}
                  className="w-full bg-violet-600 hover:bg-violet-500 text-zinc-50 font-semibold rounded-xl py-3 text-sm transition-all shadow-lg shadow-violet-600/20 hover:scale-[1.01] active:scale-[0.99] transform cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Invite {rosterMemberProfile.name?.split(' ')[0]} to a Gig
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
