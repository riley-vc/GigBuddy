import { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Music,
  ChevronRight,
  ArrowLeft,
  MessageSquare,
  UserPlus,
  X,
  Check,
  Sparkles,
} from 'lucide-react';
import PremiumBadge from './PremiumBadge.jsx';
import RatingBadge from './RatingBadge.jsx';

function InstrumentIcon() {
  return <Music className="w-3.5 h-3.5" />;
}

// ─── Invite Modal — pick a band or session band to invite this musician into ──
function InviteModal({ musician, myTeams, mySessionBands, myGigs, onInviteToTeam, onCreateSessionBandAndInvite, onInviteToSessionBand, onClose }) {
  const [mode, setMode] = useState(myTeams.length > 0 ? 'team' : 'session'); // 'team' | 'session'
  const [selectedTeamId, setSelectedTeamId] = useState(myTeams[0]?._id || '');
  const [sessionChoice, setSessionChoice] = useState(mySessionBands.length > 0 ? 'existing' : 'new');
  const [selectedSessionBandId, setSelectedSessionBandId] = useState(mySessionBands[0]?._id || '');
  const [newBandGigId, setNewBandGigId] = useState(myGigs[0]?._id || myGigs[0]?.id || '');
  const [newBandName, setNewBandName] = useState('');
  const [instrument, setInstrument] = useState((musician.instruments || [])[0] || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'team') {
        if (!selectedTeamId) { setError('Pick a band.'); setSubmitting(false); return; }
        await onInviteToTeam(selectedTeamId, musician, instrument);
      } else if (sessionChoice === 'existing') {
        if (!selectedSessionBandId) { setError('Pick a session band.'); setSubmitting(false); return; }
        await onInviteToSessionBand(selectedSessionBandId, musician, instrument);
      } else {
        if (!newBandGigId) { setError('Pick which gig this session band is for.'); setSubmitting(false); return; }
        const gig = myGigs.find((g) => (g._id || g.id) === newBandGigId);
        await onCreateSessionBandAndInvite({
          name: newBandName.trim() || `Session lineup for ${gig?.title || 'the gig'}`,
          gigId: newBandGigId,
        }, musician, instrument);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full bg-zinc-900 border border-zinc-800 rounded-t-2xl shadow-2xl max-h-[88vh] overflow-y-auto">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900 z-10">
          <div>
            <h3 className="font-bold text-zinc-50 text-base">Invite {musician.name?.split(' ')[0]}</h3>
            <p className="text-xs text-zinc-500">Add them to a band or session lineup</p>
          </div>
          <button id="close-invite-modal" onClick={onClose} className="text-zinc-400 hover:text-zinc-50 p-1.5 hover:bg-zinc-800 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex gap-2">
            <button
              id="invite-mode-team"
              type="button"
              onClick={() => setMode('team')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                mode === 'team' ? 'bg-violet-600 border-violet-600 text-zinc-50' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
            >
              My Band
            </button>
            <button
              id="invite-mode-session"
              type="button"
              onClick={() => setMode('session')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                mode === 'session' ? 'bg-violet-600 border-violet-600 text-zinc-50' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
            >
              Session Band
            </button>
          </div>

          {mode === 'team' && (
            myTeams.length === 0 ? (
              <p className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg">
                You don't manage any bands yet. Create one from the Band tab first.
              </p>
            ) : (
              <div className="space-y-2">
                {myTeams.map((t) => (
                  <label key={t._id} className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer ${selectedTeamId === t._id ? 'border-violet-500/70 bg-violet-600/5' : 'border-zinc-800 bg-zinc-950'}`}>
                    <input type="radio" name="team" checked={selectedTeamId === t._id} onChange={() => setSelectedTeamId(t._id)} className="accent-violet-600" />
                    <span className="text-sm text-zinc-200 font-medium">{t.name}</span>
                  </label>
                ))}
              </div>
            )
          )}

          {mode === 'session' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  id="session-choice-existing"
                  type="button"
                  onClick={() => setSessionChoice('existing')}
                  disabled={mySessionBands.length === 0}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer disabled:opacity-40 ${
                    sessionChoice === 'existing' ? 'bg-zinc-800 border-zinc-700 text-zinc-50' : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                  }`}
                >
                  Existing Session Band
                </button>
                <button
                  id="session-choice-new"
                  type="button"
                  onClick={() => setSessionChoice('new')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                    sessionChoice === 'new' ? 'bg-zinc-800 border-zinc-700 text-zinc-50' : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                  }`}
                >
                  Create New
                </button>
              </div>

              {sessionChoice === 'existing' ? (
                mySessionBands.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No session bands yet — create one instead.</p>
                ) : (
                  <div className="space-y-2">
                    {mySessionBands.map((b) => (
                      <label key={b._id} className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer ${selectedSessionBandId === b._id ? 'border-violet-500/70 bg-violet-600/5' : 'border-zinc-800 bg-zinc-950'}`}>
                        <input type="radio" name="sband" checked={selectedSessionBandId === b._id} onChange={() => setSelectedSessionBandId(b._id)} className="accent-violet-600" />
                        <div className="min-w-0">
                          <span className="text-sm text-zinc-200 font-medium block truncate">{b.name}</span>
                          <span className="text-[10px] text-zinc-500">{b.gigId?.title}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Which gig is this for?</label>
                    {myGigs.length === 0 ? (
                      <p className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg">
                        You have no booked gigs to attach a session band to yet.
                      </p>
                    ) : (
                      <select
                        id="session-band-gig-select"
                        value={newBandGigId}
                        onChange={(e) => setNewBandGigId(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-violet-500"
                      >
                        {myGigs.map((g) => (
                          <option key={g._id || g.id} value={g._id || g.id}>{g.title}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Session band name (optional)</label>
                    <input
                      id="session-band-name-input"
                      type="text"
                      value={newBandName}
                      onChange={(e) => setNewBandName(e.target.value)}
                      placeholder="e.g. Weekend Warriors"
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-violet-500 placeholder:text-zinc-600"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Their instrument/role</label>
            {(musician.instruments || []).length > 0 ? (
              <select
                id="invite-instrument-input"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-violet-500"
              >
                {musician.instruments.map((inst) => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
            ) : (
              <input
                id="invite-instrument-input"
                type="text"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                placeholder="No instruments listed on their profile"
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-violet-500 placeholder:text-zinc-600"
              />
            )}
          </div>

          {error && (
            <p className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            id="send-band-invite-btn"
            type="submit"
            disabled={submitting}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-zinc-50 rounded-xl py-3 text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {submitting ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function MusicianSocialPage({
  musicians,
  profile,
  myTeams = [],
  mySessionBands = [],
  myGigs = [],
  onOpenDirectChat,
  onInviteToTeam,
  onInviteToSessionBand,
  onCreateSessionBandAndInvite,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMusicianId, setSelectedMusicianId] = useState(null);
  const [inviteTarget, setInviteTarget] = useState(null);
  const [invitedIds, setInvitedIds] = useState(new Set());

  const otherMusicians = useMemo(
    () => musicians.filter((m) => (m._id || m.id) !== profile._id),
    [musicians, profile._id]
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return otherMusicians;
    return otherMusicians.filter((m) =>
      m.name?.toLowerCase().includes(q) ||
      (m.instruments || []).some((i) => i.toLowerCase().includes(q)) ||
      (m.genres || []).some((g) => g.toLowerCase().includes(q)) ||
      m.location?.toLowerCase().includes(q)
    );
  }, [otherMusicians, searchQuery]);

  const selected = musicians.find((m) => (m._id || m.id) === selectedMusicianId);

  const wrapInvite = (fn) => async (...args) => {
    await fn(...args);
    setInvitedIds((prev) => new Set(prev).add(inviteTarget._id || inviteTarget.id));
  };

  return (
    <div id="musician-social-page" className="space-y-4">
      {/* ── Full-screen profile drill-down ─────────────────────────────────── */}
      {selected ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 shrink-0">
            <button
              id="back-to-musician-list"
              onClick={() => setSelectedMusicianId(null)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-zinc-50">Profile</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="relative bg-gradient-to-br from-violet-600/10 via-zinc-950 to-fuchsia-900/10 border-b border-zinc-800 p-6">
              <div className="flex items-start gap-4">
                <img
                  referrerPolicy="no-referrer"
                  src={selected.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selected.name)}&background=7c3aed&color=fff&size=160`}
                  alt={selected.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-violet-500/30 shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="font-extrabold text-zinc-50 text-xl truncate">{selected.name}</h2>
                  <p className="text-sm text-violet-300 font-medium mt-0.5 flex items-center gap-1.5">
                    <InstrumentIcon />
                    {(selected.instruments || []).join(' · ') || 'Musician'}
                  </p>
                  {selected.location && (
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      {selected.location}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {selected.bio && (
                <div>
                  <h5 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Bio</h5>
                  <p className="text-xs text-zinc-300 leading-relaxed italic bg-zinc-900/40 p-3.5 rounded-lg border border-zinc-800">
                    "{selected.bio}"
                  </p>
                </div>
              )}
              {(selected.genres || []).length > 0 && (
                <div>
                  <h5 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Genres</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.genres.map((g) => (
                      <span key={g} className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded text-xs font-semibold uppercase">{g}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-zinc-800 bg-zinc-950 shrink-0 flex gap-2.5 pb-safe">
            <button
              id="chat-with-musician-btn"
              type="button"
              onClick={() => onOpenDirectChat(selected)}
              className="flex-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 rounded-xl py-3 text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-violet-400" />
              Chat
            </button>
            {invitedIds.has(selected._id || selected.id) ? (
              <div className="flex-1 bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Invited
              </div>
            ) : (
              <button
                id="invite-musician-btn"
                type="button"
                onClick={() => setInviteTarget(selected)}
                className="flex-1 bg-violet-600 hover:bg-violet-500 text-zinc-50 rounded-xl py-3 text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Invite
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* ── List view ─────────────────────────────────────────────────── */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              id="search-musicians-input"
              type="text"
              placeholder="Search by name, instrument, genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="space-y-2.5">
            {filtered.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-400 text-sm">
                No musicians match your search.
              </div>
            ) : (
              filtered.map((m) => {
                const mId = m._id || m.id;
                return (
                  <div
                    id={`musician-card-${mId}`}
                    key={mId}
                    onClick={() => setSelectedMusicianId(mId)}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-zinc-700 transition-colors flex items-center gap-3.5"
                  >
                    <img
                      referrerPolicy="no-referrer"
                      src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=7c3aed&color=fff&size=80`}
                      alt={m.name}
                      className="w-12 h-12 rounded-xl object-cover border border-zinc-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-zinc-50 text-sm truncate">{m.name}</h4>
                        {m.isPremium && <PremiumBadge compact />}
                        <RatingBadge rating={m.rating} />
                      </div>
                      <p className="text-[11px] text-violet-400 font-medium truncate">{(m.instruments || []).join(', ') || 'Musician'}</p>
                      {m.location && (
                        <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {m.location}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ── Invite Modal ──────────────────────────────────────────────────── */}
      {inviteTarget && (
        <InviteModal
          musician={inviteTarget}
          myTeams={myTeams}
          mySessionBands={mySessionBands}
          myGigs={myGigs}
          onInviteToTeam={wrapInvite(onInviteToTeam)}
          onInviteToSessionBand={wrapInvite(onInviteToSessionBand)}
          onCreateSessionBandAndInvite={wrapInvite(onCreateSessionBandAndInvite)}
          onClose={() => setInviteTarget(null)}
        />
      )}
    </div>
  );
}
