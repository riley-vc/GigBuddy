import { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Clock, Search, Music, ListFilter, Send, Check, X, ChevronLeft, AlertTriangle } from 'lucide-react';
import PremiumBadge from './PremiumBadge.jsx';
import RatingBadge from './RatingBadge.jsx';
import { findConflictingContract } from '../utils/booking.js';

export default function GigMarketplace({ gigs, applications, contracts = [], profile, myCreatedTeams = [], onApply, initialFocusGigId }) {
  const [selectedGigId, setSelectedGigId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const [isApplying, setIsApplying] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [chosenInstruments, setChosenInstruments] = useState([]);
  const [applyAsTeamId, setApplyAsTeamId] = useState('solo'); // 'solo' | a team _id

  const selectedGig = gigs.find((g) => (g.id || g._id) === selectedGigId) || null;

  const uniqueGenres = ['All', ...Array.from(new Set(gigs.flatMap((g) => g.genres || [])))];

  const filteredGigs = gigs.filter((gig) => {
    const matchesSearch =
      gig.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.venueName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (gig.instruments || []).some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGenre = selectedGenre === 'All' || (gig.genres || []).includes(selectedGenre);
    const isOpen = gig.status === 'open';
    return matchesSearch && matchesGenre && isOpen;
  });

  const hasAlreadyApplied = (gigId) => {
    return applications.some(
      (a) => (a.gigId?._id || a.gigId) === gigId && (a.musicianId?._id || a.musicianId) === profile._id
    );
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!selectedGig) return;
    if (chosenInstruments.length === 0) return;
    const gigId = selectedGig.id || selectedGig._id;
    const applyAsTeam = applyAsTeamId !== 'solo' ? myCreatedTeams.find((t) => t._id === applyAsTeamId) : null;
    const applicantName = applyAsTeam ? applyAsTeam.name : profile.name;
    onApply(
      gigId,
      chosenInstruments.join(', '),
      coverNote || `Hey! This is ${applicantName}. I'm extremely interested in your call and am fully available on the date. I'll bring top tier equipment and energy!`,
      profile.skills || [],
      applyAsTeam
    );
    setCoverNote('');
    setChosenInstruments([]);
    setApplyAsTeamId('solo');
    setIsApplying(false);
  };

  const handleSelectGig = (gigId) => {
    setSelectedGigId(gigId);
    setIsApplying(false);
    setChosenInstruments([]);
    setApplyAsTeamId('solo');
  };

  // Deep-link support: auto-open a gig when arriving via a "View Gig"
  // recommendation link. Guarded so it only fires once per id.
  const consumedFocusRef = useRef(null);
  useEffect(() => {
    if (initialFocusGigId && consumedFocusRef.current !== initialFocusGigId) {
      consumedFocusRef.current = initialFocusGigId;
      handleSelectGig(initialFocusGigId);
    }
  }, [initialFocusGigId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBack = () => {
    setSelectedGigId(null);
    setIsApplying(false);
  };

  // Own-schedule double-booking check — does applying to this gig conflict
  // with a gig the musician is already contracted for?
  const gigsById = {};
  gigs.forEach((g) => { gigsById[(g._id || g.id)?.toString()] = g; });
  const conflict = selectedGig ? findConflictingContract(selectedGig, profile._id, contracts, gigsById) : null;

  // ── Shared props for GigDetail (defined outside — see bottom of file) ─────────
  const gigDetailProps = {
    selectedGig,
    isApplying,
    setIsApplying,
    coverNote,
    setCoverNote,
    chosenInstruments,
    setChosenInstruments,
    handleApplySubmit,
    hasAlreadyApplied,
    myCreatedTeams,
    applyAsTeamId,
    setApplyAsTeamId,
    profile,
    conflict,
  };

  return (
    <div id="gig-marketplace-container" className="space-y-4">
      {/* Search & Filter */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
          <input
            id="search-gig-input"
            type="text"
            placeholder="Search venue, instrument, title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-violet-500"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <ListFilter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          {uniqueGenres.slice(0, 8).map((genre) => (
            <button
              id={`filter-genre-${genre}`}
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded text-[11px] font-semibold uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
                selectedGenre === genre
                  ? 'bg-violet-600 text-zinc-50'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* ── MOBILE: List view → sheet drill-down ──────────────────────────── */}
      <div className="lg:hidden space-y-3">
        {filteredGigs.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-400 text-sm">
            No matching open calls found.
          </div>
        ) : (
          filteredGigs.map((gig) => {
            const gigId = gig.id || gig._id;
            const applied = hasAlreadyApplied(gigId);
            return (
              <button
                id={`gig-card-${gigId}`}
                key={gigId}
                onClick={() => handleSelectGig(gigId)}
                className="w-full text-left border rounded-xl p-4 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all relative overflow-hidden active:scale-[0.98]"
              >
                {applied && (
                  <div className="absolute top-0 right-0 p-1 bg-emerald-500/10 border-l border-b border-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold uppercase tracking-wider rounded-bl">
                    Applied
                  </div>
                )}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="font-mono text-[10px] font-bold text-violet-400 bg-violet-500/5 px-2 py-0.5 rounded uppercase tracking-wider">
                    {(gig.genres || [])[0] || 'Open Call'}
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">₱{gig.budget?.toLocaleString()}</span>
                </div>
                {gig.isPromoted && <PremiumBadge className="mb-2" />}
                <h4 className="font-bold text-zinc-50 text-sm leading-snug mb-2">{gig.title}</h4>
                <p className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                  <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                  <span className="truncate">{gig.venueName}</span>
                </p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/50 text-[10px] text-zinc-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-600" />
                    {gig.date ? new Date(gig.date).toLocaleDateString() : ''}
                  </span>
                  <span className="text-zinc-400">Req: {(gig.instruments || [])[0] || 'Open'}</span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* ── MOBILE: Gig Detail Bottom Sheet ──────────────────────────────── */}
      {selectedGig && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleBack} />
          {/* Sheet */}
          <div className="relative mt-auto w-full bg-zinc-900 border-t border-zinc-700 rounded-t-2xl shadow-2xl animate-slide-up flex flex-col max-h-[92vh]">
            {/* Sheet handle + close */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-zinc-800 shrink-0">
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 text-sm font-semibold cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <div className="w-10 h-1 rounded-full bg-zinc-700 absolute left-1/2 -translate-x-1/2 top-2" />
              <button onClick={handleBack} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Detail content */}
            <div className="flex flex-col flex-1 overflow-y-auto p-5 space-y-0 gap-0">
              <div className="flex flex-col flex-1 min-h-0 space-y-5">
                <GigDetail {...gigDetailProps} />
              </div>
            </div>
            {/* Safe area spacer */}
            <div className="pb-safe" />
          </div>
        </div>
      )}

      {/* ── DESKTOP: Split Pane (unchanged) ──────────────────────────────── */}
      <div className="hidden lg:grid grid-cols-12 gap-6 min-h-[550px] items-start">
        {/* Left: Gig List */}
        <div className="col-span-5 space-y-3 h-[580px] overflow-y-auto pr-1">
          {filteredGigs.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-400">
              No matching open calls found.
            </div>
          ) : (
            filteredGigs.map((gig) => {
              const gigId = gig.id || gig._id;
              const active = selectedGigId === gigId;
              const applied = hasAlreadyApplied(gigId);
              return (
                <div
                  id={`gig-card-desktop-${gigId}`}
                  key={gigId}
                  onClick={() => handleSelectGig(gigId)}
                  className={`border rounded-xl p-4 cursor-pointer text-left transition-all relative overflow-hidden ${
                    active
                      ? 'bg-zinc-900 border-violet-500/80 shadow-md shadow-violet-600/5'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {applied && (
                    <div className="absolute top-0 right-0 p-1 bg-emerald-500/10 border-l border-b border-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold uppercase tracking-wider rounded-bl">
                      Applied
                    </div>
                  )}
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="font-mono text-[10px] font-bold text-violet-400 bg-violet-500/5 px-2 py-0.5 rounded uppercase tracking-wider">
                      {(gig.genres || [])[0] || 'Open Call'}
                    </span>
                    <span className="font-mono font-bold text-emerald-400 text-xs">₱{gig.budget?.toLocaleString()}</span>
                  </div>
                  {gig.isPromoted && <PremiumBadge className="mb-2" />}
                  <h4 className="font-bold text-zinc-50 text-sm line-clamp-1 leading-snug">{gig.title}</h4>
                  <p className="text-xs text-zinc-400 flex items-center gap-1 mt-2.5 font-mono">
                    <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                    <span className="truncate">{gig.venueName}</span>
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/50 text-[10px] text-zinc-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-600" />
                      {gig.date ? new Date(gig.date).toLocaleDateString() : ''}
                    </span>
                    <span className="text-zinc-400">Req: {(gig.instruments || [])[0] || 'Open'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Detail Pane */}
        <div className="col-span-7 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl h-[580px] flex flex-col justify-between">
          {!selectedGig ? (
            <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
              Select an open call to review full specs
            </div>
          ) : (
            <GigDetail {...gigDetailProps} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── GigDetail — top-level component (MUST be outside GigMarketplace to avoid
// keyboard-dismiss bug: inner arrow functions get a new identity each render,
// causing React to fully unmount/remount the DOM, losing input focus)
function GigDetail({
  selectedGig,
  isApplying,
  setIsApplying,
  coverNote,
  setCoverNote,
  chosenInstruments,
  setChosenInstruments,
  handleApplySubmit,
  hasAlreadyApplied,
  myCreatedTeams,
  applyAsTeamId,
  setApplyAsTeamId,
  profile,
  conflict,
}) {
  const gigInstruments = selectedGig?.instruments?.length > 0 ? selectedGig.instruments : [];
  const needsSelection = gigInstruments.length > 0 && chosenInstruments.length === 0;

  const toggleInstrument = (inst) => {
    setChosenInstruments((prev) =>
      prev.includes(inst) ? prev.filter((i) => i !== inst) : [...prev, inst]
    );
  };

  if (!selectedGig) return null;
  const gigId = selectedGig.id || selectedGig._id;
  const applied = hasAlreadyApplied(gigId);
  return (
    <>
      <div className="space-y-5 overflow-y-auto flex-1 pr-1">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <span className="px-2.5 py-0.5 bg-violet-500/10 text-violet-400 text-[10px] uppercase font-bold font-mono tracking-wider rounded border border-violet-500/15">
              Open Audition Call
            </span>
            <span className="text-xs font-mono text-zinc-500">
              Posted {selectedGig.createdAt ? new Date(selectedGig.createdAt).toLocaleDateString() : ''}
            </span>
          </div>
          <h3 className="font-extrabold text-zinc-50 text-lg leading-snug">{selectedGig.title}</h3>
          {selectedGig.organizerRating != null && (
            <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
              Organizer rating: <RatingBadge rating={selectedGig.organizerRating} count={selectedGig.organizerRatingCount} />
            </p>
          )}
        </div>

        {/* Logistics Badges */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
            <span className="text-zinc-500 text-[10px] uppercase font-mono block mb-1">Talent Budget</span>
            <span className="text-base font-bold text-emerald-400 font-mono">₱{selectedGig.budget?.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
            <span className="text-zinc-500 text-[10px] uppercase font-mono block mb-1">Target Instruments</span>
            <span className="text-xs font-semibold text-zinc-200 block truncate">{(selectedGig.instruments || []).join(', ')}</span>
          </div>
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg col-span-2 md:col-span-1">
            <span className="text-zinc-500 text-[10px] uppercase font-mono block mb-1">Genre Tags</span>
            <span className="text-xs font-semibold text-zinc-200 block truncate">{(selectedGig.genres || []).join(', ')}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-2.5 text-xs font-mono">
          <h5 className="font-bold text-zinc-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-violet-400" />
            Tight Timeline Windows
          </h5>
          <div className="space-y-1.5 text-zinc-300">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Soundcheck Check-In:</span>
              <span className="font-bold text-zinc-200">{selectedGig.soundcheckTime || '--:--'} (Strict)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Set Performance:</span>
              <span className="font-bold text-zinc-200">{selectedGig.setTime || '--:--'} - {selectedGig.endTime || '--:--'}</span>
            </div>
          </div>
        </div>

        {/* Backline */}
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Provided On-Site Backline Gear</h5>
          <div className="flex flex-wrap gap-1.5">
            {(selectedGig.backlineProvided || []).map((item) => (
              <span key={item} className="px-2.5 py-1 bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 rounded-md text-[10px] font-mono">
                ✓ {item}
              </span>
            ))}
            {(selectedGig.backlineProvided || []).length === 0 && (
              <span className="text-xs text-zinc-500 italic">No backline provided. Artist must bring complete gear.</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Event Scope & Performance Clauses</h5>
          <p className="text-xs text-zinc-400 leading-relaxed italic bg-zinc-950/30 p-3 rounded-lg border border-zinc-800">
            "{selectedGig.description}"
          </p>
        </div>
      </div>

      {/* CTA / Apply Form */}
      <div className="pt-4 border-t border-zinc-800 shrink-0">
        {isApplying ? (
          <form onSubmit={handleApplySubmit} className="space-y-3.5 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            {myCreatedTeams.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Applying as:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    id="apply-as-solo"
                    type="button"
                    onClick={() => setApplyAsTeamId('solo')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      applyAsTeamId === 'solo'
                        ? 'bg-violet-600 border-violet-600 text-zinc-50'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    {profile.name} (Solo)
                  </button>
                  {myCreatedTeams.map((team) => (
                    <button
                      id={`apply-as-team-${team._id}`}
                      key={team._id}
                      type="button"
                      onClick={() => setApplyAsTeamId(team._id)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        applyAsTeamId === team._id
                          ? 'bg-violet-600 border-violet-600 text-zinc-50'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      {team.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Instrument(s) / Role(s) you'll fill:
              </label>
              {gigInstruments.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {gigInstruments.map((inst) => {
                    const checked = chosenInstruments.includes(inst);
                    return (
                      <label
                        key={inst}
                        htmlFor={`inst-${inst}`}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors select-none ${
                          checked
                            ? 'bg-violet-600/15 border-violet-500/50 text-violet-300'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                          checked ? 'bg-violet-600 border-violet-500' : 'border-zinc-600 bg-zinc-800'
                        }`}>
                          {checked && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <input id={`inst-${inst}`} type="checkbox" className="sr-only" checked={checked} onChange={() => toggleInstrument(inst)} />
                        <span className="text-xs font-semibold">{inst}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">
                  No specific instruments required — describe your role in the cover note.
                </p>
              )}
              {chosenInstruments.length > 0 && (
                <p className="text-[10px] text-violet-400 font-mono mt-2">Selected: {chosenInstruments.join(', ')}</p>
              )}
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Cover Note for Planner:
              </label>
              <textarea
                id="apply-cover-note"
                rows={3}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Tell the client why you're a great fit, your availability, and setup details..."
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded p-2 focus:outline-none placeholder:text-zinc-600 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                id="cancel-apply-btn"
                type="button"
                onClick={() => setIsApplying(false)}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg py-3 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="send-apply-btn"
                type="submit"
                disabled={needsSelection}
                className={`flex-1 rounded-lg py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  needsSelection
                    ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-500 text-zinc-50 cursor-pointer'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                {needsSelection ? 'Select an instrument first' : 'Submit Application'}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex gap-3">
            {applied ? (
              <div className="w-full bg-emerald-500/10 border border-emerald-500/15 p-3 rounded-lg text-emerald-400 text-center text-xs font-semibold flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Application Submitted Successfully (Pending Review)</span>
              </div>
            ) : conflict ? (
              <div id="apply-time-conflict" className="w-full bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-amber-400 text-center text-xs font-semibold flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Time Conflict — you're already booked for "{conflict.gigTitle}" during this window</span>
              </div>
            ) : (
              <button
                id={`btn-apply-profile-${gigId}`}
                onClick={() => setIsApplying(true)}
                className="w-full bg-violet-600 hover:bg-violet-500 text-zinc-50 font-semibold rounded-lg py-3.5 text-sm transition-colors shadow-lg shadow-violet-600/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Music className="w-4 h-4" /> Apply with Musician Profile
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
