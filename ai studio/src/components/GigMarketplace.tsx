import React, { useState } from 'react';
import { MapPin, Calendar, Clock, DollarSign, Search, Tag, Music, ListFilter, Send, ShieldAlert, Check, HelpCircle } from 'lucide-react';
import { Gig, Application, MusicianProfile } from '../types';

interface GigMarketplaceProps {
  gigs: Gig[];
  applications: Application[];
  profile: MusicianProfile;
  onApply: (gigId: string, instrument: string, coverNote: string, skills: string[]) => void;
}

export default function GigMarketplace({ gigs, applications, profile, onApply }: GigMarketplaceProps) {
  const [selectedGigId, setSelectedGigId] = useState<string>(gigs[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  
  // Application Modal/Tray State
  const [isApplying, setIsApplying] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [chosenInstrument, setChosenInstrument] = useState(profile.primaryInstrument);
  const [chosenSkills, setChosenSkills] = useState<string[]>([...profile.skills]);

  const selectedGig = gigs.find((g) => g.id === selectedGigId) || gigs[0];

  // Filter genres list for tab selectors
  const uniqueGenres = ['All', ...Array.from(new Set(gigs.flatMap((g) => g.genres)))];

  // Filter gigs
  const filteredGigs = gigs.filter((gig) => {
    const matchesSearch = 
      gig.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      gig.venueName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      gig.instruments.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesGenre = selectedGenre === 'All' || gig.genres.includes(selectedGenre);
    const isOpen = gig.status === 'open';

    return matchesSearch && matchesGenre && isOpen;
  });

  // Check if already applied to the selected gig
  const hasAlreadyApplied = (gigId: string) => {
    return applications.some((a) => a.gigId === gigId && a.musicianId === profile.id);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGig) return;

    onApply(
      selectedGig.id,
      chosenInstrument,
      coverNote || `Hey! This is ${profile.name}, I am extremely interested in your call and am fully available on ${selectedGig.date}. I'll bring top tier equipment and energy!`,
      chosenSkills
    );

    // Reset application form state
    setCoverNote('');
    setIsApplying(false);
  };

  const handleToggleSkill = (skill: string) => {
    if (chosenSkills.includes(skill)) {
      setChosenSkills(chosenSkills.filter((s) => s !== skill));
    } else {
      setChosenSkills([...chosenSkills, skill]);
    }
  };

  return (
    <div id="gig-marketplace-container" className="space-y-4">
      {/* Search & Filtering Area */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            id="search-gig-input"
            type="text"
            placeholder="Search venue, instrument, title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Horizontal Genre Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
          <ListFilter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          {uniqueGenres.slice(0, 7).map((genre) => (
            <button
              id={`filter-genre-${genre}`}
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1 rounded text-[11px] font-semibold uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
                selectedGenre === genre
                  ? 'bg-violet-600 text-zinc-50'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-850'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Split-Pane View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px] items-start">
        
        {/* Left Pane: Scrollable List of Sleek Cards */}
        <div className="lg:col-span-5 space-y-3 h-[580px] overflow-y-auto pr-1">
          {filteredGigs.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-400">
              No matching open calls found.
            </div>
          ) : (
            filteredGigs.map((gig) => {
              const active = selectedGigId === gig.id;
              const applied = hasAlreadyApplied(gig.id);

              return (
                <div
                  id={`gig-card-${gig.id}`}
                  key={gig.id}
                  onClick={() => {
                    setSelectedGigId(gig.id);
                    setIsApplying(false); // Close open form when swapping gigs
                  }}
                  className={`border rounded-xl p-4.5 cursor-pointer text-left transition-all relative overflow-hidden ${
                    active
                      ? 'bg-zinc-900 border-violet-500/80 shadow-md shadow-violet-600/5'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* Applied Indicator */}
                  {applied && (
                    <div className="absolute top-0 right-0 p-1 bg-emerald-500/10 border-l border-b border-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold uppercase tracking-wider rounded-bl">
                      Applied
                    </div>
                  )}

                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="font-mono text-[10px] font-bold text-violet-400 bg-violet-500/5 px-2 py-0.5 rounded uppercase tracking-wider">
                      {gig.genres[0]}
                    </span>
                    <span className="font-mono font-bold text-emerald-400 text-xs">${gig.budget}</span>
                  </div>

                  <h4 className="font-display font-bold text-zinc-50 text-sm line-clamp-1 leading-snug">
                    {gig.title}
                  </h4>

                  <p className="text-xs text-zinc-400 flex items-center gap-1 mt-2.5 font-mono">
                    <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                    <span className="truncate">{gig.venueName}</span>
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/50 text-[10px] text-zinc-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-600" /> {gig.date}
                    </span>
                    <span className="text-zinc-400">
                      Req: {gig.instruments[0]}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Pane: Deep Logistical Profile */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl h-[580px] flex flex-col justify-between">
          {!selectedGig ? (
            <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
              Select an open call to review full specs
            </div>
          ) : (
            <>
              {/* Detailed Logistics Content */}
              <div className="space-y-5 overflow-y-auto flex-1 pr-1">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <span className="px-2.5 py-0.5 bg-violet-500/10 text-violet-400 text-[10px] uppercase font-bold font-mono tracking-wider rounded border border-violet-500/15">
                      Open Audition Call
                    </span>
                    <span className="text-xs font-mono text-zinc-500">Published {selectedGig.createdAt}</span>
                  </div>

                  <h3 className="font-display font-extrabold text-zinc-50 text-lg leading-snug">
                    {selectedGig.title}
                  </h3>
                </div>

                {/* Logistics Badges Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg">
                    <span className="text-zinc-500 text-[10px] uppercase font-mono block mb-1">Talent Budget</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">${selectedGig.budget}</span>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg col-span-1">
                    <span className="text-zinc-500 text-[10px] uppercase font-mono block mb-1">Target Instruments</span>
                    <span className="text-xs font-semibold text-zinc-200 block truncate">{selectedGig.instruments.join(', ')}</span>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg col-span-2 md:col-span-1">
                    <span className="text-zinc-500 text-[10px] uppercase font-mono block mb-1">Target Genre tags</span>
                    <span className="text-xs font-semibold text-zinc-200 block truncate">{selectedGig.genres.join(', ')}</span>
                  </div>
                </div>

                {/* Timeline window slider */}
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-lg space-y-2.5 text-xs font-mono">
                  <h5 className="font-bold text-zinc-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-violet-400" />
                    Tight Timeline Windows
                  </h5>
                  <div className="space-y-1.5 text-zinc-300">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Soundcheck Check-In:</span>
                      <span className="font-bold text-zinc-200">{selectedGig.soundcheckTime} (Strict)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Set Performance:</span>
                      <span className="font-bold text-zinc-200">{selectedGig.setTime} - {selectedGig.endTime}</span>
                    </div>
                  </div>
                </div>

                {/* Backline items list */}
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Provided On-Site Backline Gear</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedGig.backlineProvided.map((item) => (
                      <span key={item} className="px-2.5 py-1 bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 rounded-md text-[10px] font-mono">
                        ✓ {item}
                      </span>
                    ))}
                    {selectedGig.backlineProvided.length === 0 && (
                      <span className="text-xs text-zinc-500 italic">No backline provided. Artist must bring complete gear.</span>
                    )}
                  </div>
                </div>

                {/* Detailed description */}
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">Event Scope & Performance Clauses</h5>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans italic bg-zinc-950/30 p-3 rounded-lg border border-zinc-850">
                    "{selectedGig.description}"
                  </p>
                </div>
              </div>

              {/* Action area / CTA Form */}
              <div className="pt-4 border-t border-zinc-800">
                {isApplying ? (
                  <form onSubmit={handleApplySubmit} className="space-y-3.5 bg-zinc-950 p-4 rounded-xl border border-zinc-850 animate-fade-in">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                        Select Instrument for performance:
                      </label>
                      <select
                        id="apply-instrument-select"
                        value={chosenInstrument}
                        onChange={(e) => setChosenInstrument(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded p-2 focus:outline-none"
                      >
                        {profile.primaryInstrument.split('&').map((inst) => (
                          <option key={inst.trim()} value={inst.trim()}>
                            {inst.trim()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                        Cover Note for Planner:
                      </label>
                      <textarea
                        id="apply-cover-note"
                        rows={2}
                        value={coverNote}
                        onChange={(e) => setCoverNote(e.target.value)}
                        placeholder="Tell the client why you're a great fit, your availability, and setup gear details..."
                        className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded p-2 focus:outline-none placeholder:text-zinc-600 resize-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        id="cancel-apply-btn"
                        type="button"
                        onClick={() => setIsApplying(false)}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded py-2 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        id="send-apply-btn"
                        type="submit"
                        className="flex-1 bg-violet-600 hover:bg-violet-500 text-zinc-50 rounded py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit Application
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex gap-3">
                    {hasAlreadyApplied(selectedGig.id) ? (
                      <div className="w-full bg-emerald-500/10 border border-emerald-500/15 p-3 rounded-lg text-emerald-400 text-center text-xs font-semibold flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4" />
                        <span>Application Submitted Successfully (Pending Review)</span>
                      </div>
                    ) : (
                      <button
                        id={`btn-apply-profile-${selectedGig.id}`}
                        onClick={() => setIsApplying(true)}
                        className="w-full bg-violet-600 hover:bg-violet-500 text-zinc-50 font-semibold rounded-lg py-3 text-xs transition-colors shadow-lg shadow-violet-600/10 flex items-center justify-center gap-2 cursor-pointer"
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
