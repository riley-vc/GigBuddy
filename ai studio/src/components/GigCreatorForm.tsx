import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, MapPin, Tag, Plus, Check, Info, FilePlus2, Sparkles } from 'lucide-react';
import { Gig } from '../types';

interface GigCreatorFormProps {
  onCreateGig: (gig: Omit<Gig, 'id' | 'createdAt' | 'status' | 'organizerId'>) => void;
  onSuccess: () => void;
}

const GENRE_PRESETS = ['Jazz', 'Rock', 'Acoustic', 'Blues', 'Funk', 'Heavy Metal', 'Pop-Punk', 'Classical-Crossover', 'Electronic', 'Synthwave', 'Folk', 'Hip-Hop'];
const INSTRUMENT_PRESETS = ['Double Bass', 'Electric Guitar (Lead)', 'Violin', 'Drums (Sessionist)', 'Keyboardist', 'Vocalist (Lead)', 'Alto Saxophone', 'Trumpet', 'Cello'];
const BACKLINE_PRESETS = ['Acoustic Grand Piano', 'Yamaha Maple Custom Drum Kit', 'Marshall JCM800 Half-Stack', 'Gallien-Krueger Bass Amp', 'Bose L1 Compact PA System', 'Direct Box (DI)', 'Vocal Microphone Shure Beta 58A'];

export default function GigCreatorForm({ onCreateGig, onSuccess }: GigCreatorFormProps) {
  // Form fields
  const [title, setTitle] = useState('');
  const [venueName, setVenueName] = useState('');
  const [date, setDate] = useState('');
  const [soundcheckTime, setSoundcheckTime] = useState('18:00');
  const [setTime, setSetTime] = useState('20:30');
  const [endTime, setEndTime] = useState('23:00');
  const [budget, setBudget] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  // Technical Requirements (tag arrays)
  const [genres, setGenres] = useState<string[]>(['Jazz']);
  const [instruments, setInstruments] = useState<string[]>(['Double Bass']);
  const [backlineProvided, setBacklineProvided] = useState<string[]>(['Direct Box (DI)']);

  // Custom single inputs
  const [customGenre, setCustomGenre] = useState('');
  const [customInstrument, setCustomInstrument] = useState('');
  const [customBackline, setCustomBackline] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const toggleGenre = (genre: string) => {
    if (genres.includes(genre)) {
      setGenres(genres.filter((g) => g !== genre));
    } else {
      setGenres([...genres, genre]);
    }
  };

  const toggleInstrument = (inst: string) => {
    if (instruments.includes(inst)) {
      setInstruments(instruments.filter((i) => i !== inst));
    } else {
      setInstruments([...instruments, inst]);
    }
  };

  const toggleBackline = (item: string) => {
    if (backlineProvided.includes(item)) {
      setBacklineProvided(backlineProvided.filter((b) => b !== item));
    } else {
      setBacklineProvided([...backlineProvided, item]);
    }
  };

  const addCustomGenre = () => {
    if (customGenre.trim() && !genres.includes(customGenre.trim())) {
      setGenres([...genres, customGenre.trim()]);
      setCustomGenre('');
    }
  };

  const addCustomInstrument = () => {
    if (customInstrument.trim() && !instruments.includes(customInstrument.trim())) {
      setInstruments([...instruments, customInstrument.trim()]);
      setCustomInstrument('');
    }
  };

  const addCustomBackline = () => {
    if (customBackline.trim() && !backlineProvided.includes(customBackline.trim())) {
      setBacklineProvided([...backlineProvided, customBackline.trim()]);
      setCustomBackline('');
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = 'Gig title is required';
    if (!venueName.trim()) newErrors.venueName = 'Venue name is required';
    if (!date) newErrors.date = 'Performance date is required';
    if (!soundcheckTime) newErrors.soundcheckTime = 'Soundcheck time is required';
    if (!setTime) newErrors.setTime = 'Set performance start time is required';
    if (!endTime) newErrors.endTime = 'Set performance end time is required';
    if (!budget || budget <= 0) newErrors.budget = 'A valid positive budget/compensation is required';
    if (!description.trim() || description.length < 20) {
      newErrors.description = 'Provide a description detailing sets and clothing requirements (min 20 chars)';
    }
    if (genres.length === 0) newErrors.genres = 'Select or add at least one music genre tag';
    if (instruments.length === 0) newErrors.instruments = 'Select or add at least one instrument requirement';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onCreateGig({
      title,
      venueName,
      date,
      soundcheckTime,
      setTime,
      endTime,
      budget: Number(budget),
      genres,
      instruments,
      backlineProvided,
      description,
    });

    // Reset Form
    setTitle('');
    setVenueName('');
    setDate('');
    setSoundcheckTime('18:00');
    setSetTime('20:30');
    setEndTime('23:00');
    setBudget('');
    setDescription('');
    setGenres(['Jazz']);
    setInstruments(['Double Bass']);
    setBacklineProvided(['Direct Box (DI)']);
    
    // Trigger Success Callback
    onSuccess();
  };

  return (
    <div id="gig-creator-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Form Area */}
      <div id="gig-creator-form-block" className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
          <div className="p-2.5 bg-violet-600/10 text-violet-400 rounded-lg">
            <FilePlus2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-zinc-50 text-lg">Generate Open Gig Call</h2>
            <p className="text-xs text-zinc-400">Specify requirements to auto-draft MoA contract clauses</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Event / Gig Title
            </label>
            <input
              id="input-gig-title"
              type="text"
              placeholder="e.g. Lead Guitarist Needed for Classic Rock Showcase"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            />
            {errors.title && <p id="err-title" className="text-xs text-amber-400 mt-1">{errors.title}</p>}
          </div>

          {/* Venue & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Venue Name / Atmosphere
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input
                  id="input-venue-name"
                  type="text"
                  placeholder="e.g. Under the Oak Cellars"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 rounded-lg py-2.5 pl-10 pr-3.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
              </div>
              {errors.venueName && <p id="err-venueName" className="text-xs text-amber-400 mt-1">{errors.venueName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Performance Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input
                  id="input-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 rounded-lg py-2.5 pl-10 pr-3.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
              </div>
              {errors.date && <p id="err-date" className="text-xs text-amber-400 mt-1">{errors.date}</p>}
            </div>
          </div>

          {/* Timeline Windows */}
          <div className="p-4 bg-zinc-950/55 border border-zinc-800/80 rounded-lg space-y-4">
            <h4 className="text-xs font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-violet-400" />
              Strict Schedule Parameters
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1 font-mono uppercase">Soundcheck Start</label>
                <input
                  id="input-soundcheck"
                  type="time"
                  value={soundcheckTime}
                  onChange={(e) => setSoundcheckTime(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded p-1.5 text-xs focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1 font-mono uppercase">Performance Set</label>
                <input
                  id="input-settime"
                  type="time"
                  value={setTime}
                  onChange={(e) => setSetTime(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded p-1.5 text-xs focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1 font-mono uppercase">Show Curfew / End</label>
                <input
                  id="input-endtime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded p-1.5 text-xs focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Numerical Talent Fee (USD Budget)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 w-4 h-4 text-emerald-400" />
              <input
                id="input-budget"
                type="number"
                placeholder="e.g. 500"
                value={budget}
                onChange={(e) => setBudget(e.target.value !== '' ? Number(e.target.value) : '')}
                className="w-full bg-zinc-950 border border-zinc-800 text-emerald-400 font-bold rounded-lg py-2.5 pl-10 pr-3.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1.5">This fee will be held in secure escrow to protect performance clauses.</p>
            {errors.budget && <p id="err-budget" className="text-xs text-amber-400 mt-1">{errors.budget}</p>}
          </div>

          {/* Genres (Multi Select with Presets) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Musical Genres
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 mb-2">
              {GENRE_PRESETS.map((genre) => (
                <button
                  id={`preset-genre-${genre}`}
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer flex items-center gap-1 ${
                    genres.includes(genre)
                      ? 'bg-violet-600 text-zinc-50 font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {genres.includes(genre) && <Check className="w-3 h-3" />}
                  <span>{genre}</span>
                </button>
              ))}
            </div>
            
            {/* Custom Genre Input */}
            <div className="flex gap-2">
              <input
                id="custom-genre-input"
                type="text"
                placeholder="Or add custom genre tag..."
                value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-850 rounded-lg py-1.5 px-3 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
              />
              <button
                id="add-custom-genre-btn"
                type="button"
                onClick={addCustomGenre}
                className="px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            {errors.genres && <p id="err-genres" className="text-xs text-amber-400 mt-1">{errors.genres}</p>}
          </div>

          {/* Instruments (Multi Select with Presets) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Required Performance Instruments
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 mb-2">
              {INSTRUMENT_PRESETS.map((inst) => (
                <button
                  id={`preset-instrument-${inst}`}
                  key={inst}
                  type="button"
                  onClick={() => toggleInstrument(inst)}
                  className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer flex items-center gap-1 ${
                    instruments.includes(inst)
                      ? 'bg-violet-600 text-zinc-50 font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {instruments.includes(inst) && <Check className="w-3 h-3" />}
                  <span>{inst}</span>
                </button>
              ))}
            </div>

            {/* Custom Instrument Input */}
            <div className="flex gap-2">
              <input
                id="custom-instrument-input"
                type="text"
                placeholder="Or add custom instrument tag..."
                value={customInstrument}
                onChange={(e) => setCustomInstrument(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-850 rounded-lg py-1.5 px-3 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
              />
              <button
                id="add-custom-instrument-btn"
                type="button"
                onClick={addCustomInstrument}
                className="px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            {errors.instruments && <p id="err-instruments" className="text-xs text-amber-400 mt-1">{errors.instruments}</p>}
          </div>

          {/* Backline Provisions (Multi Select with Presets) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Provided Venue Backline & Tech Gear
            </label>
            <p className="text-[10px] text-zinc-500 mb-1.5">What professional gear is already on-site for the artist?</p>
            <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 mb-2">
              {BACKLINE_PRESETS.map((item) => (
                <button
                  id={`preset-backline-${item}`}
                  key={item}
                  type="button"
                  onClick={() => toggleBackline(item)}
                  className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer flex items-center gap-1 ${
                    backlineProvided.includes(item)
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  {backlineProvided.includes(item) && <Check className="w-3 h-3" />}
                  <span>{item}</span>
                </button>
              ))}
            </div>

            {/* Custom Backline Input */}
            <div className="flex gap-2">
              <input
                id="custom-backline-input"
                type="text"
                placeholder="Or add custom backline equipment..."
                value={customBackline}
                onChange={(e) => setCustomBackline(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-850 rounded-lg py-1.5 px-3 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
              />
              <button
                id="add-custom-backline-btn"
                type="button"
                onClick={addCustomBackline}
                className="px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Logistical Profile & Venue Notes
            </label>
            <textarea
              id="input-description"
              rows={4}
              placeholder="Provide a detailed overview. (e.g. Set times, soundcheck, required outfits, food provision, audience vibe...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-zinc-600 resize-none"
            />
            {errors.description && <p id="err-description" className="text-xs text-amber-400 mt-1">{errors.description}</p>}
          </div>

          {/* Submit */}
          <button
            id="publish-gig-btn"
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-500 text-zinc-50 font-semibold rounded-lg py-3 text-sm transition-colors shadow-lg shadow-violet-600/20 hover:scale-[1.01] active:scale-[0.99] transform cursor-pointer"
          >
            Publish Open Gig Call & Unlock Escrow Setup
          </button>
        </form>
      </div>

      {/* Live Preview Card */}
      <div id="gig-creator-preview-block" className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-1.5 bg-violet-600 text-zinc-50 text-[9px] uppercase tracking-widest font-bold font-mono rounded-bl">
            Live Preview
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-2.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Artist View Profile</span>
          </div>

          <h3 className="font-display font-extrabold text-zinc-50 text-xl tracking-tight leading-snug">
            {title.trim() || 'Untitled Musician Call'}
          </h3>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-xs text-zinc-400">
            <div className="flex items-center gap-1 text-zinc-300">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
              <span>{venueName.trim() || 'Specify venue...'}</span>
            </div>
            <div className="flex items-center gap-1 text-zinc-300">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>{date || 'Set date...'}</span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="mt-4 p-3 bg-zinc-950 border border-zinc-850 rounded-lg flex items-center justify-between">
            <div className="text-xs">
              <span className="text-zinc-500 block">Offer (Escrow Secured)</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">${budget || '0'}</span>
            </div>
            <div className="text-right text-xs">
              <span className="text-zinc-500 block">Required Instruments</span>
              <span className="text-zinc-300 font-medium block">
                {instruments.length > 0 ? instruments.join(', ') : 'None selected'}
              </span>
            </div>
          </div>

          {/* Genres */}
          <div className="mt-4 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block">Target Genres</span>
            <div className="flex flex-wrap gap-1">
              {genres.map((g) => (
                <span key={g} className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 rounded uppercase font-semibold">
                  {g}
                </span>
              ))}
              {genres.length === 0 && <span className="text-xs text-zinc-500 italic">No genres selected yet</span>}
            </div>
          </div>

          {/* Logistics Preview */}
          <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-500" /> Soundcheck
              </span>
              <span className="font-mono text-zinc-200">{soundcheckTime || '--:--'}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-500" /> Performance Set
              </span>
              <span className="font-mono text-zinc-200">{setTime || '--:--'} - {endTime || '--:--'}</span>
            </div>
          </div>

          {/* Backline Provision List */}
          <div className="mt-4 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block">On-Site Gear Provided</span>
            <div className="flex flex-wrap gap-1">
              {backlineProvided.map((item) => (
                <span key={item} className="px-2 py-0.5 bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 text-[9px] rounded font-mono">
                  ✓ {item}
                </span>
              ))}
              {backlineProvided.length === 0 && <span className="text-xs text-zinc-500 italic">No gear specified</span>}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800">
            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block mb-1">Details Summary</span>
            <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed italic">
              "{description || 'Awaiting logistical text detailing specific timelines, clothing requirements, and song guidelines...'}"
            </p>
          </div>
        </div>

        {/* Tip Box */}
        <div className="bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-xl flex gap-3">
          <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-zinc-400">
            <strong className="text-zinc-300">Contract Integrity Principle:</strong> Setting precise timelines and gear lists reduces musician disputes. These parameters are directly embedded into the Standard Performance Agreement (MoA) signature modal upon application approval.
          </div>
        </div>
      </div>
    </div>
  );
}
