import { useState } from 'react';
import { Calendar, Clock, DollarSign, MapPin, Plus, Check, Info, FilePlus2, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

const GENRE_PRESETS = ['OPM', 'Bisrock', 'P-pop', 'Kundiman', 'Jazz-OPM', 'Alternative OPM', 'Acoustic OPM', 'Indie PH', 'Electronic', 'Rock PH', 'Folk PH', 'R&B PH'];
const INSTRUMENT_PRESETS = ['Acoustic Guitar', 'Electric Guitar', 'Bass Guitar', 'Drums', 'Vocals (Lead)', 'Keyboard', 'Piano', 'Violin', 'Alto Saxophone', 'Cajon', 'Trumpet'];
const BACKLINE_PRESETS = ['Roland FP-90 Digital Piano', 'Yamaha Stage Custom Drum Kit', 'Marshall DSL40CR Combo', 'Hartke HD75 Bass Combo', 'Bose L1 Compact PA System', 'DI Box (Radial)', 'Shure SM58 Vocal Mic', 'Shure SM137 Instrument Mic'];

const STEP_LABELS = ['Event Info', 'Schedule & Budget', 'Talent Specs'];

export default function GigCreatorForm({ onCreateGig, onSuccess }) {
  // Step state
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [title, setTitle] = useState('');
  const [venueName, setVenueName] = useState('');
  const [date, setDate] = useState('');

  // Step 2 fields
  const [soundcheckTime, setSoundcheckTime] = useState('18:00');
  const [setTime, setSetTime] = useState('20:30');
  const [endTime, setEndTime] = useState('23:00');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');

  // Step 3 fields
  const [genres, setGenres] = useState(['Jazz']);
  const [instruments, setInstruments] = useState(['Double Bass']);
  const [backlineProvided, setBacklineProvided] = useState(['Direct Box (DI)']);
  const [customGenre, setCustomGenre] = useState('');
  const [customInstrument, setCustomInstrument] = useState('');
  const [customBackline, setCustomBackline] = useState('');

  const [errors, setErrors] = useState({});

  const toggle = (arr, setArr, val) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const addCustom = (val, arr, setArr, setInput) => {
    if (val.trim() && !arr.includes(val.trim())) {
      setArr([...arr, val.trim()]);
      setInput('');
    }
  };

  // Per-step validation
  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!title.trim()) e.title = 'Gig title is required';
      if (!venueName.trim()) e.venueName = 'Venue name is required';
      if (!date) {
        e.date = 'Performance date is required';
      } else {
        const selected = new Date(date);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        if (selected <= today) e.date = 'Performance date must be a future date';
      }
    }
    if (s === 2) {
      if (!soundcheckTime) e.soundcheckTime = 'Soundcheck time is required';
      if (!setTime) e.setTime = 'Set time is required';
      if (!endTime) e.endTime = 'End time is required';
      if (!budget || Number(budget) <= 0) e.budget = 'A valid positive budget is required';
      if (!description.trim() || description.length < 20) e.description = 'Provide a description (min 20 chars)';
    }
    if (s === 3) {
      if (genres.length === 0) e.genres = 'Select at least one genre';
      if (instruments.length === 0) e.instruments = 'Select at least one instrument';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    await onCreateGig({
      title, venueName, date,
      soundcheckTime, setTime, endTime,
      budget: Number(budget),
      genres, instruments, backlineProvided,
      description,
    });
    // Reset
    setTitle(''); setVenueName(''); setDate('');
    setSoundcheckTime('18:00'); setSetTime('20:30'); setEndTime('23:00');
    setBudget(''); setDescription('');
    setGenres(['Jazz']); setInstruments(['Double Bass']); setBacklineProvided(['Direct Box (DI)']);
    setStep(1);
    onSuccess();
  };

  const TagPicker = ({ label, items, selected, onToggle, customVal, setCustomVal, onAdd, errorKey }) => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 mb-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(item)}
            className={`px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              selected.includes(item)
                ? 'bg-violet-600 text-zinc-50 font-semibold'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {selected.includes(item) && <Check className="w-3 h-3" />}
            <span>{item}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={`Or add custom ${label.toLowerCase()}...`}
          value={customVal}
          onChange={(e) => setCustomVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-zinc-300 focus:outline-none focus:border-zinc-700"
        />
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
      {errors[errorKey] && <p className="text-xs text-amber-400 mt-1">{errors[errorKey]}</p>}
    </div>
  );

  return (
    <div id="gig-creator-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Form */}
      <div id="gig-creator-form-block" className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
          <div className="p-2.5 bg-violet-600/10 text-violet-400 rounded-lg">
            <FilePlus2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-zinc-50 text-lg">Post an Open Gig Call</h2>
            <p className="text-xs text-zinc-400">Step {step} of 3 — {STEP_LABELS[step - 1]}</p>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-2 mb-6">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                  done ? 'bg-emerald-500 text-white' : active ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {done ? <Check className="w-3.5 h-3.5" /> : n}
                </div>
                <span className={`text-[11px] font-semibold hidden sm:block ${active ? 'text-zinc-200' : done ? 'text-emerald-400' : 'text-zinc-600'}`}>
                  {label}
                </span>
                {i < 2 && <div className={`flex-1 h-0.5 rounded ${done ? 'bg-emerald-500/40' : 'bg-zinc-800'}`} />}
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── STEP 1: Event Info ──────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Event / Gig Title</label>
                <input
                  id="input-gig-title"
                  type="text"
                  placeholder="e.g. Lead Guitarist Needed for Classic Rock Showcase"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 rounded-lg py-3 px-3.5 focus:outline-none focus:border-violet-500 transition-colors"
                />
                {errors.title && <p className="text-xs text-amber-400 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Venue Name</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                  <input
                    id="input-venue-name"
                    type="text"
                    placeholder="e.g. BGC Arts Center, Bonifacio Global City"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 rounded-lg py-3 pl-10 pr-3.5 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                {errors.venueName && <p className="text-xs text-amber-400 mt-1">{errors.venueName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Performance Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                  <input
                    id="input-date"
                    type="date"
                    value={date}
                    min={(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })()}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 rounded-lg py-3 pl-10 pr-3.5 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                {errors.date && <p className="text-xs text-amber-400 mt-1">{errors.date}</p>}
              </div>
            </div>
          )}

          {/* ── STEP 2: Schedule & Budget ───────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 bg-zinc-950/55 border border-zinc-800/80 rounded-lg space-y-4">
                <h4 className="text-xs font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-violet-400" />
                  Strict Schedule Parameters
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Soundcheck Start', val: soundcheckTime, set: setSoundcheckTime, id: 'input-soundcheck', err: 'soundcheckTime' },
                    { label: 'Performance Set', val: setTime, set: setSetTime, id: 'input-settime', err: 'setTime' },
                    { label: 'Show End / Curfew', val: endTime, set: setEndTime, id: 'input-endtime', err: 'endTime' },
                  ].map(({ label, val, set, id, err }) => (
                    <div key={id}>
                      <label className="block text-[10px] text-zinc-500 mb-1 font-mono uppercase">{label}</label>
                      <input
                        id={id}
                        type="time"
                        value={val}
                        onChange={(e) => set(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg p-2.5 focus:outline-none focus:border-violet-500 font-mono"
                      />
                      {errors[err] && <p className="text-[10px] text-amber-400 mt-0.5">{errors[err]}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Talent Fee Budget (₱ PHP)</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-emerald-400 font-bold text-base">₱</span>
                  <input
                    id="input-budget"
                    type="number"
                    placeholder="e.g. 12000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-emerald-400 font-bold rounded-lg py-3 pl-8 pr-3.5 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1.5">This fee will be held in secure escrow to protect performance clauses.</p>
                {errors.budget && <p className="text-xs text-amber-400 mt-1">{errors.budget}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Logistical Profile & Venue Notes</label>
                <textarea
                  id="input-description"
                  rows={4}
                  placeholder="Provide a detailed overview. (e.g. Set times, soundcheck, required outfits, food provision, audience vibe...)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 rounded-lg py-2.5 px-3.5 focus:outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-600 resize-none"
                />
                {errors.description && <p className="text-xs text-amber-400 mt-1">{errors.description}</p>}
              </div>
            </div>
          )}

          {/* ── STEP 3: Talent Specs ────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <TagPicker
                label="Musical Genres"
                items={GENRE_PRESETS}
                selected={genres}
                onToggle={(g) => toggle(genres, setGenres, g)}
                customVal={customGenre}
                setCustomVal={setCustomGenre}
                onAdd={() => addCustom(customGenre, genres, setGenres, setCustomGenre)}
                errorKey="genres"
              />

              <TagPicker
                label="Required Performance Instruments"
                items={INSTRUMENT_PRESETS}
                selected={instruments}
                onToggle={(i) => toggle(instruments, setInstruments, i)}
                customVal={customInstrument}
                setCustomVal={setCustomInstrument}
                onAdd={() => addCustom(customInstrument, instruments, setInstruments, setCustomInstrument)}
                errorKey="instruments"
              />

              {/* Backline */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Provided Venue Backline & Tech Gear</label>
                <p className="text-[10px] text-zinc-500 mb-1.5">What professional gear is already on-site for the artist?</p>
                <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 mb-2">
                  {BACKLINE_PRESETS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggle(backlineProvided, setBacklineProvided, item)}
                      className={`px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
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
                <div className="flex gap-2">
                  <input
                    id="custom-backline-input"
                    type="text"
                    placeholder="Or add custom backline equipment..."
                    value={customBackline}
                    onChange={(e) => setCustomBackline(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom(customBackline, backlineProvided, setBacklineProvided, setCustomBackline))}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-zinc-300 focus:outline-none focus:border-zinc-700"
                  />
                  <button
                    id="add-custom-backline-btn"
                    type="button"
                    onClick={() => addCustom(customBackline, backlineProvided, setBacklineProvided, setCustomBackline)}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                id={`wizard-next-step-${step}`}
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-zinc-50 font-semibold rounded-lg py-3 text-sm transition-colors shadow-lg shadow-violet-600/20 cursor-pointer"
              >
                Next: {STEP_LABELS[step]}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="publish-gig-btn"
                type="submit"
                className="flex-1 bg-violet-600 hover:bg-violet-500 text-zinc-50 font-semibold rounded-lg py-3 text-sm transition-colors shadow-lg shadow-violet-600/20 hover:scale-[1.01] active:scale-[0.99] transform cursor-pointer"
              >
                Publish Open Gig Call & Unlock Escrow Setup
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Live Preview — sticky on desktop, hidden on mobile until step 2+ */}
      <div id="gig-creator-preview-block" className="hidden lg:block lg:col-span-5 space-y-4 lg:sticky lg:top-24">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-1.5 bg-violet-600 text-zinc-50 text-[9px] uppercase tracking-widest font-bold font-mono rounded-bl">
            Live Preview
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-2.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Artist View Profile</span>
          </div>
          <h3 className="font-extrabold text-zinc-50 text-xl tracking-tight leading-snug">
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
          <div className="mt-4 p-3 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-between">
            <div className="text-xs">
              <span className="text-zinc-500 block">Offer (Escrow Secured)</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">₱{budget ? Number(budget).toLocaleString() : '0'}</span>
            </div>
            <div className="text-right text-xs">
              <span className="text-zinc-500 block">Required Instruments</span>
              <span className="text-zinc-300 font-medium block">{instruments.length > 0 ? instruments.join(', ') : 'None selected'}</span>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block">Target Genres</span>
            <div className="flex flex-wrap gap-1">
              {genres.map((g) => (
                <span key={g} className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 rounded uppercase font-semibold">{g}</span>
              ))}
              {genres.length === 0 && <span className="text-xs text-zinc-500 italic">No genres selected yet</span>}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2 text-xs">
            {[
              { label: 'Soundcheck', val: soundcheckTime },
              { label: 'Performance Set', val: `${setTime} - ${endTime}` },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center justify-between text-zinc-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-zinc-500" /> {label}</span>
                <span className="font-mono text-zinc-200">{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-xl flex gap-3">
          <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-zinc-400">
            <strong className="text-zinc-300">Contract Integrity Principle:</strong> Setting precise timelines and gear lists reduces musician disputes. These parameters are directly embedded into the Standard Performance Agreement (MoA) upon application approval.
          </div>
        </div>
      </div>
    </div>
  );
}
