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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              referrerPolicy="no-referrer"
              src={musician.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(musician.name)}&background=4f46e5&color=fff&size=80`}
              alt={musician.name}
              className="w-10 h-10 rounded-xl object-cover border border-gray-200"
            />
            <div>
              <h3 className="font-bold text-gray-900 text-base">Invite {musician.name}</h3>
              <p className="text-xs text-indigo-600">{(musician.instruments || [])[0] || 'Musician'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Gig Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Select Gig to Invite For
            </label>
            {openGigs.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 p-3 rounded-lg">
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
                          ? 'border-indigo-500 bg-indigo-50/50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      } ${invited ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="gig-select"
                        value={gigId}
                        checked={selectedGigId === gigId}
                        onChange={() => !invited && setSelectedGigId(gigId)}
                        disabled={invited}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{gig.title}</p>
                        <p className="text-[10px] font-mono text-gray-500 truncate">{gig.venueName} · ₱{gig.budget?.toLocaleString()}</p>
                        {invited && (
                          <span className="text-[9px] text-emerald-600 font-mono uppercase">✓ Already Invited</span>
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              Personal Note (optional)
            </label>
            <textarea
              id="invite-note-input"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={`Hi ${musician.name?.split(' ')[0]}, we'd love to have you for this gig! Your profile stood out to us...`}
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 py-2.5 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="send-invite-btn"
              type="submit"
              disabled={openGigs.length === 0}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
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
      <div className="card p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              id="search-artist-input"
              type="text"
              placeholder="Search by name, instrument, genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-gray-900 font-semibold">{filteredMusicians.length}</span>
            <span>verified artist{filteredMusicians.length !== 1 ? 's' : ''} available</span>
          </div>
        </div>

        {/* Filter rows */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <ListFilter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider w-16 shrink-0">Instrument</span>
            {allInstruments.slice(0, 10).map((inst) => (
              <button
                key={inst}
                id={`filter-inst-${inst}`}
                onClick={() => setSelectedInstrument(inst)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  selectedInstrument === inst
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {inst}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <ListFilter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider w-16 shrink-0">Genre</span>
            {allGenres.slice(0, 10).map((genre) => (
              <button
                key={genre}
                id={`filter-genre-artist-${genre}`}
                onClick={() => setSelectedGenre(genre)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  selectedGenre === genre
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'
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
            <div className="card p-8 text-center text-gray-500 text-sm">
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
                  className={`border rounded-xl p-4 cursor-pointer transition-all relative overflow-hidden bg-white ${
                    active
                      ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/20'
                      : 'border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      <img
                        referrerPolicy="no-referrer"
                        src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=4f46e5&color=fff&size=80`}
                        alt={m.name}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                      />
                      {invited && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{m.name}</h4>
                        {m.genres?.length > 0 && (
                          <BadgeCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-indigo-600 font-medium flex items-center gap-1 mt-0.5">
                        <InstrumentIcon name={(m.instruments || [])[0]} />
                        <span className="truncate">{(m.instruments || []).join(', ') || 'Musician'}</span>
                      </p>
                      {m.location && (
                        <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-1 font-mono">
                          <MapPin className="w-3 h-3" />
                          <span>{m.location}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {invites > 0 && (
                        <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                          {invites} invite{invites > 1 ? 's' : ''} sent
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 transition-colors ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
                    </div>
                  </div>

                  {/* Genre tags */}
                  {(m.genres || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
                      {m.genres.slice(0, 4).map((g) => (
                        <span key={g} className="px-1.5 py-0.5 bg-gray-50 text-[9px] font-mono text-gray-500 border border-gray-200 rounded">
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
        <div className="lg:col-span-7 card p-0 overflow-hidden">
          {!selectedArtist ? (
            <div className="h-[620px] flex items-center justify-center text-gray-500 text-sm">
              Select an artist to view their profile
            </div>
          ) : (
            <>
              {/* Hero */}
              <div className="relative bg-gradient-to-br from-indigo-50 via-white to-indigo-50/50 border-b border-gray-100 p-6">
                <div className="flex items-start gap-5">
                  <img
                    referrerPolicy="no-referrer"
                    src={selectedArtist.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedArtist.name)}&background=4f46e5&color=fff&size=160`}
                    alt={selectedArtist.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-100 shadow-md shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-extrabold text-gray-900 text-2xl tracking-tight">
                          {selectedArtist.name}
                        </h2>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-indigo-100">
                          Verified Artist
                        </span>
                      </div>
                      <p className="text-sm text-indigo-600 font-medium mt-0.5 flex items-center gap-1.5">
                        <InstrumentIcon name={(selectedArtist.instruments || [])[0]} />
                        {(selectedArtist.instruments || []).join(' · ') || 'Musician'}
                      </p>
                    </div>
                    {selectedArtist.location && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {selectedArtist.location}
                      </p>
                    )}
                    <div className="flex items-center gap-3 pt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                      ))}
                      <span className="text-xs text-gray-500 font-mono">4.8 · Verified Pro</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-5 max-h-[380px] overflow-y-auto">
                {/* Bio */}
                {selectedArtist.bio && (
                  <div>
                    <h5 className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-2">Artist Bio</h5>
                    <p className="text-xs text-gray-700 leading-relaxed italic bg-gray-50 p-3.5 rounded-lg border border-gray-100">
                      "{selectedArtist.bio}"
                    </p>
                  </div>
                )}

                {/* Instruments */}
                {(selectedArtist.instruments || []).length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-2">Instruments</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedArtist.instruments.map((inst) => (
                        <span key={inst} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-medium">
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
                    <h5 className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-2">Genre Expertise</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedArtist.genres.map((g) => (
                        <span key={g} className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 rounded text-xs font-semibold uppercase tracking-wide">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past activity on platform */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Gigs Done', val: '12', color: 'text-emerald-600' },
                    { label: 'Avg Response', val: '< 2h', color: 'text-indigo-600' },
                    { label: 'Cancellations', val: '0', color: 'text-gray-500' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center">
                      <span className={`text-lg font-extrabold font-mono block ${color}`}>{val}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="px-6 pb-6">
                {successIds.has(selectedArtist._id || selectedArtist.id) ? (
                  <div className="space-y-2">
                    <div className="w-full bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-600 text-sm font-semibold flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      Invitation Sent!
                    </div>
                    {inviteConvoMap[selectedArtist._id || selectedArtist.id] && onOpenInviteChat && (
                      <button
                        id={`open-chat-${selectedArtist._id || selectedArtist.id}`}
                        onClick={() => onOpenInviteChat(inviteConvoMap[selectedArtist._id || selectedArtist.id])}
                        className="btn-secondary w-full py-2.5 text-sm flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                        Open Chat with {selectedArtist.name?.split(' ')[0]}
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    id={`invite-artist-${selectedArtist._id || selectedArtist.id}`}
                    onClick={() => setInviteTarget(selectedArtist)}
                    className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2"
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
