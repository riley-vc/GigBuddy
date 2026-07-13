import { useState, useMemo } from 'react';
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
function InviteModal({ musician, openGigs, existingApplications, onSend, onClose }) {
  const [selectedGigId, setSelectedGigId] = useState(openGigs[0]?._id || openGigs[0]?.id || '');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const alreadyInvited = (gigId) =>
    existingApplications.some(
      (a) => (a.gigId?._id || a.gigId) === gigId &&
              (a.musicianId?._id || a.musicianId) === (musician._id || musician.id)
    );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedGigId) { setError('Please select a gig.'); return; }
    if (alreadyInvited(selectedGigId)) {
      setError('You have already sent an invite for this gig to this artist.'); return;
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
                  return (
                    <label
                      key={gigId}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedGigId === gigId
                          ? 'border-violet-500/70 bg-violet-600/5'
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950'
                      } ${invited ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="gig-select"
                        value={gigId}
                        checked={selectedGigId === gigId}
                        onChange={() => !invited && setSelectedGigId(gigId)}
                        disabled={invited}
                        className="mt-0.5 accent-violet-600 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-100 truncate">{gig.title}</p>
                        <p className="text-[10px] font-mono text-zinc-500 truncate">{gig.venueName} · ₱{gig.budget?.toLocaleString()}</p>
                        {invited && (
                          <span className="text-[9px] text-emerald-400 font-mono uppercase">✓ Already Invited</span>
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
  gigs,
  applications,
  onInvite,
  onOpenInviteChat,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedArtistId, setSelectedArtistId] = useState(
    musicians[0]?._id || musicians[0]?.id || ''
  );
  const [inviteTarget, setInviteTarget] = useState(null); // musician being invited
  const [successIds, setSuccessIds] = useState(new Set()); // musician IDs that got invited
  // Map: musicianId → conversationId returned from the invite
  const [inviteConvoMap, setInviteConvoMap] = useState({});

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

  const openGigs = gigs.filter((g) => g.status === 'open');

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

  return (
    <div id="artist-marketplace-container" className="space-y-4">
      {/* Search & Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              id="search-artist-input"
              type="text"
              placeholder="Search by name, instrument, genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
            <UserCheck className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-zinc-300 font-semibold">{filteredMusicians.length}</span>
            <span>verified artist{filteredMusicians.length !== 1 ? 's' : ''} available</span>
          </div>
        </div>

        {/* Filter rows */}
        <div className="space-y-2">
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
                  onClick={() => setSelectedArtistId(mId)}
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

        {/* Right: Artist Profile Detail */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
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

              {/* Details */}
              <div className="p-6 space-y-5 max-h-[380px] overflow-y-auto">
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

              {/* CTA */}
              <div className="px-6 pb-6">
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

      {/* Invite Modal */}
      {inviteTarget && (
        <InviteModal
          musician={inviteTarget}
          openGigs={openGigs}
          existingApplications={applications}
          onSend={handleSendInvite}
          onClose={() => setInviteTarget(null)}
        />
      )}
    </div>
  );
}
