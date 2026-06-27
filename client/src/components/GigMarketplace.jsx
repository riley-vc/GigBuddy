import { useState } from 'react';
import { MapPin, Calendar, Clock, Search, Music, ListFilter, Send, Check } from 'lucide-react';

export default function GigMarketplace({ gigs, applications, profile, onApply }) {
  const [selectedGigId, setSelectedGigId] = useState(gigs[0]?.id || gigs[0]?._id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const [isApplying, setIsApplying] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [chosenInstrument, setChosenInstrument] = useState(profile.primaryInstrument || '');

  const selectedGig = gigs.find((g) => (g.id || g._id) === selectedGigId) || gigs[0];

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

    const gigId = selectedGig.id || selectedGig._id;
    onApply(
      gigId,
      chosenInstrument,
      coverNote || `Hey! This is ${profile.name}. I'm extremely interested in your call and am fully available on the date. I'll bring top tier equipment and energy!`,
      profile.skills || []
    );

    setCoverNote('');
    setIsApplying(false);
  };

  return (
    <div id="gig-marketplace-container" className="space-y-4">
      {/* Search & Filter */}
      <div className="card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            id="search-gig-input"
            type="text"
            placeholder="Search venue, instrument, title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
          <ListFilter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          {uniqueGenres.slice(0, 8).map((genre) => (
            <button
              id={`filter-genre-${genre}`}
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1 rounded text-[11px] font-semibold uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
                selectedGenre === genre
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Split-Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px] items-start">
        {/* Left: Gig List */}
        <div className="lg:col-span-5 space-y-3 h-[580px] overflow-y-auto pr-1">
          {filteredGigs.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              No matching open calls found.
            </div>
          ) : (
            filteredGigs.map((gig) => {
              const gigId = gig.id || gig._id;
              const active = selectedGigId === gigId;
              const applied = hasAlreadyApplied(gigId);

              return (
                <div
                  id={`gig-card-${gigId}`}
                  key={gigId}
                  onClick={() => {
                    setSelectedGigId(gigId);
                    setIsApplying(false);
                  }}
                  className={`border rounded-xl p-4 cursor-pointer text-left transition-all relative overflow-hidden bg-white ${
                    active
                      ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/20'
                      : 'border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  {applied && (
                    <div className="absolute top-0 right-0 p-1 bg-emerald-50 border-l border-b border-emerald-100 text-emerald-600 text-[9px] font-mono font-bold uppercase tracking-wider rounded-bl">
                      Applied
                    </div>
                  )}

                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider border border-indigo-100">
                      {(gig.genres || [])[0] || 'Open Call'}
                    </span>
                    <span className="font-mono font-bold text-emerald-600 text-xs">₱{gig.budget?.toLocaleString()}</span>
                  </div>

                  <h4 className="font-bold text-gray-900 text-sm line-clamp-1 leading-snug">{gig.title}</h4>

                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-2.5 font-mono">
                    <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="truncate">{gig.venueName}</span>
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-[10px] text-gray-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {gig.date ? new Date(gig.date).toLocaleDateString() : ''}
                    </span>
                    <span className="text-gray-400">
                      Req: {(gig.instruments || [])[0] || 'Open'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Detail Pane */}
        <div className="lg:col-span-7 card p-6 h-[580px] flex flex-col justify-between">
          {!selectedGig ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-xs">
              Select an open call to review full specs
            </div>
          ) : (
            <>
              <div className="space-y-5 overflow-y-auto flex-1 pr-1">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] uppercase font-bold font-mono tracking-wider rounded border border-indigo-100">
                      Open Audition Call
                    </span>
                    <span className="text-xs font-mono text-gray-400">
                      Posted {selectedGig.createdAt ? new Date(selectedGig.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-lg leading-snug">{selectedGig.title}</h3>
                </div>

                {/* Logistics Badges */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                    <span className="text-gray-500 text-[10px] uppercase font-mono block mb-1">Talent Budget</span>
                    <span className="text-base font-bold text-emerald-600 font-mono">₱{selectedGig.budget?.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                    <span className="text-gray-500 text-[10px] uppercase font-mono block mb-1">Target Instruments</span>
                    <span className="text-xs font-semibold text-gray-800 block truncate">{(selectedGig.instruments || []).join(', ')}</span>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg col-span-2 md:col-span-1">
                    <span className="text-gray-500 text-[10px] uppercase font-mono block mb-1">Genre Tags</span>
                    <span className="text-xs font-semibold text-gray-800 block truncate">{(selectedGig.genres || []).join(', ')}</span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg space-y-2.5 text-xs font-mono shadow-sm">
                  <h5 className="font-bold text-gray-600 uppercase tracking-wider text-[11px] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    Tight Timeline Windows
                  </h5>
                  <div className="space-y-1.5 text-gray-600">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Soundcheck Check-In:</span>
                      <span className="font-bold text-gray-800">{selectedGig.soundcheckTime || '--:--'} (Strict)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Set Performance:</span>
                      <span className="font-bold text-gray-800">{selectedGig.setTime || '--:--'} - {selectedGig.endTime || '--:--'}</span>
                    </div>
                  </div>
                </div>

                {/* Backline */}
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Provided On-Site Backline Gear</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedGig.backlineProvided || []).map((item) => (
                      <span key={item} className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[10px] font-mono">
                        ✓ {item}
                      </span>
                    ))}
                    {(selectedGig.backlineProvided || []).length === 0 && (
                      <span className="text-xs text-gray-400 italic">No backline provided. Artist must bring complete gear.</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Event Scope & Performance Clauses</h5>
                  <p className="text-xs text-gray-600 leading-relaxed italic bg-gray-50 p-3 rounded-lg border border-gray-100">
                    "{selectedGig.description}"
                  </p>
                </div>
              </div>

              {/* CTA / Apply Form */}
              <div className="pt-4 border-t border-gray-200 mt-4">
                {isApplying ? (
                  <form onSubmit={handleApplySubmit} className="space-y-3.5 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-fade-in shadow-sm">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                        Instrument for performance:
                      </label>
                      <input
                        id="apply-instrument-input"
                        type="text"
                        value={chosenInstrument}
                        onChange={(e) => setChosenInstrument(e.target.value)}
                        className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded p-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                        Cover Note for Planner:
                      </label>
                      <textarea
                        id="apply-cover-note"
                        rows={2}
                        value={coverNote}
                        onChange={(e) => setCoverNote(e.target.value)}
                        placeholder="Tell the client why you're a great fit, your availability, and setup details..."
                        className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded p-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400 resize-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        id="cancel-apply-btn"
                        type="button"
                        onClick={() => setIsApplying(false)}
                        className="btn-secondary flex-1 py-2 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        id="send-apply-btn"
                        type="submit"
                        className="btn-primary flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit Application
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex gap-3">
                    {hasAlreadyApplied(selectedGig.id || selectedGig._id) ? (
                      <div className="w-full bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-emerald-600 text-center text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm">
                        <Check className="w-4 h-4" />
                        <span>Application Submitted Successfully (Pending Review)</span>
                      </div>
                    ) : (
                      <button
                        id={`btn-apply-profile-${selectedGig.id || selectedGig._id}`}
                        onClick={() => setIsApplying(true)}
                        className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2"
                      >
                        <Music className="w-4 h-4" /> Apply with Musician Profile
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
