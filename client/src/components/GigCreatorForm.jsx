import { useState } from 'react';
import { Calendar, Clock, DollarSign, MapPin, Plus, Check, Info, FilePlus2, Sparkles } from 'lucide-react';

const GENRE_PRESETS = ['OPM', 'Bisrock', 'P-pop', 'Kundiman', 'Jazz-OPM', 'Alternative OPM', 'Acoustic OPM', 'Indie PH', 'Electronic', 'Rock PH', 'Folk PH', 'R&B PH'];
const INSTRUMENT_PRESETS = ['Acoustic Guitar', 'Electric Guitar', 'Bass Guitar', 'Drums', 'Vocals (Lead)', 'Keyboard', 'Piano', 'Violin', 'Alto Saxophone', 'Cajon', 'Trumpet'];
const BACKLINE_PRESETS = ['Roland FP-90 Digital Piano', 'Yamaha Stage Custom Drum Kit', 'Marshall DSL40CR Combo', 'Hartke HD75 Bass Combo', 'Bose L1 Compact PA System', 'DI Box (Radial)', 'Shure SM58 Vocal Mic', 'Shure SM137 Instrument Mic'];

export default function GigCreatorForm({ onCreateGig, onSuccess }) {
  const [title, setTitle] = useState('');
  const [venueName, setVenueName] = useState('');
  const [date, setDate] = useState('');
  const [soundcheckTime, setSoundcheckTime] = useState('18:00');
  const [setTime, setSetTime] = useState('20:30');
  const [endTime, setEndTime] = useState('23:00');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');

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

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Gig title is required';
    if (!venueName.trim()) e.venueName = 'Venue name is required';
    if (!date) e.date = 'Performance date is required';
    if (!soundcheckTime) e.soundcheckTime = 'Soundcheck time is required';
    if (!setTime) e.setTime = 'Set time is required';
    if (!endTime) e.endTime = 'End time is required';
    if (!budget || Number(budget) <= 0) e.budget = 'A valid positive budget is required';
    if (!description.trim() || description.length < 20) e.description = 'Provide a description (min 20 chars)';
    if (genres.length === 0) e.genres = 'Select at least one genre';
    if (instruments.length === 0) e.instruments = 'Select at least one instrument';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    await onCreateGig({
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

    // Reset
    setTitle(''); setVenueName(''); setDate('');
    setSoundcheckTime('18:00'); setSetTime('20:30'); setEndTime('23:00');
    setBudget(''); setDescription('');
    setGenres(['Jazz']); setInstruments(['Double Bass']); setBacklineProvided(['Direct Box (DI)']);
    onSuccess();
  };

  const TagPicker = ({ label, items, selected, onToggle, customVal, setCustomVal, onAdd, errorKey }) => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto p-2.5 bg-gray-50 rounded-lg border border-gray-200 mb-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(item)}
            className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer flex items-center gap-1 ${
              selected.includes(item)
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
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
          className="flex-1 bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-xs text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={onAdd}
          className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-lg flex items-center gap-1 font-medium border border-gray-200"
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      {errors[errorKey] && <p className="text-xs text-amber-400 mt-1">{errors[errorKey]}</p>}
    </div>
  );

  return (
    <div id="gig-creator-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Form */}
      <div id="gig-creator-form-block" className="lg:col-span-7 card p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg">
            <FilePlus2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Generate Open Gig Call</h2>
            <p className="text-xs text-gray-500">Specify requirements to auto-draft MoA contract clauses</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Event / Gig Title</label>
            <input
              id="input-gig-title"
              type="text"
              placeholder="e.g. Lead Guitarist Needed for Classic Rock Showcase"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            {errors.title && <p className="text-xs text-amber-600 mt-1">{errors.title}</p>}
          </div>

          {/* Venue & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Venue Name</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  id="input-venue-name"
                  type="text"
                  placeholder="e.g. Under the Oak Cellars"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2.5 pl-10 pr-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
              {errors.venueName && <p className="text-xs text-amber-600 mt-1">{errors.venueName}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Performance Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  id="input-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2.5 pl-10 pr-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
              {errors.date && <p className="text-xs text-amber-600 mt-1">{errors.date}</p>}
            </div>
          </div>

          {/* Schedule */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
            <h4 className="text-xs font-bold text-gray-600 flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Strict Schedule Parameters
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Soundcheck Start', val: soundcheckTime, set: setSoundcheckTime, id: 'input-soundcheck' },
                { label: 'Performance Set', val: setTime, set: setSetTime, id: 'input-settime' },
                { label: 'Show Curfew / End', val: endTime, set: setEndTime, id: 'input-endtime' },
              ].map(({ label, val, set, id }) => (
                <div key={id}>
                  <label className="block text-[10px] text-gray-500 mb-1 font-mono uppercase">{label}</label>
                  <input
                    id={id}
                    type="time"
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded p-1.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Talent Fee Budget (₱ PHP)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-emerald-600 font-bold text-sm">₱</span>
              <input
                id="input-budget"
                type="number"
                placeholder="e.g. 12000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-white border border-gray-300 text-emerald-700 font-bold rounded-lg py-2.5 pl-8 pr-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1.5">This fee will be held in secure escrow to protect performance clauses.</p>
            {errors.budget && <p className="text-xs text-amber-600 mt-1">{errors.budget}</p>}
          </div>

          {/* Genres */}
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

          {/* Instruments */}
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

          {/* Backline — uses emerald style */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Provided Venue Backline & Tech Gear</label>
            <p className="text-[10px] text-gray-500 mb-1.5">What professional gear is already on-site for the artist?</p>
            <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto p-2.5 bg-gray-50 rounded-lg border border-gray-200 mb-2">
              {BACKLINE_PRESETS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggle(backlineProvided, setBacklineProvided, item)}
                  className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer flex items-center gap-1 ${
                    backlineProvided.includes(item)
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold shadow-sm'
                      : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
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
                className="flex-1 bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-xs text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                id="add-custom-backline-btn"
                type="button"
                onClick={() => addCustom(customBackline, backlineProvided, setBacklineProvided, setCustomBackline)}
                className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-lg flex items-center gap-1 font-medium border border-gray-200"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Logistical Profile & Venue Notes</label>
            <textarea
              id="input-description"
              rows={4}
              placeholder="Provide a detailed overview. (e.g. Set times, soundcheck, required outfits, food provision, audience vibe...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-gray-400 resize-none"
            />
            {errors.description && <p className="text-xs text-amber-600 mt-1">{errors.description}</p>}
          </div>

          <button
            id="publish-gig-btn"
            type="submit"
            className="btn-primary w-full py-3 text-sm"
          >
            Publish Open Gig Call & Unlock Escrow Setup
          </button>
        </form>
      </div>

      {/* Live Preview */}
      <div id="gig-creator-preview-block" className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
        <div className="card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-1.5 bg-indigo-600 text-white text-[9px] uppercase tracking-widest font-bold font-mono rounded-bl">
            Live Preview
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-600 uppercase tracking-widest mb-2.5 mt-2">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Artist View Profile</span>
          </div>
          <h3 className="font-extrabold text-gray-900 text-xl tracking-tight leading-snug">
            {title.trim() || 'Untitled Musician Call'}
          </h3>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{venueName.trim() || 'Specify venue...'}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{date || 'Set date...'}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
            <div className="text-xs">
              <span className="text-gray-500 block">Offer (Escrow Secured)</span>
              <span className="text-lg font-bold text-emerald-600 font-mono">₱{budget || '0'}</span>
            </div>
            <div className="text-right text-xs">
              <span className="text-gray-500 block">Required Instruments</span>
              <span className="text-gray-900 font-medium block">{instruments.length > 0 ? instruments.join(', ') : 'None selected'}</span>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider block">Target Genres</span>
            <div className="flex flex-wrap gap-1">
              {genres.map((g) => (
                <span key={g} className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-[10px] text-gray-700 rounded uppercase font-semibold">{g}</span>
              ))}
              {genres.length === 0 && <span className="text-xs text-gray-400 italic">No genres selected yet</span>}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs">
            {[
              { label: 'Soundcheck', val: soundcheckTime },
              { label: 'Performance Set', val: `${setTime} - ${endTime}` },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center justify-between text-gray-600">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-gray-400" /> {label}</span>
                <span className="font-mono text-gray-900 font-medium">{val}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider block">On-Site Gear Provided</span>
            <div className="flex flex-wrap gap-1">
              {backlineProvided.map((item) => (
                <span key={item} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] rounded font-mono font-medium">✓ {item}</span>
              ))}
              {backlineProvided.length === 0 && <span className="text-xs text-gray-400 italic">No gear specified</span>}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider block mb-1">Details Summary</span>
            <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed italic">
              "{description || 'Awaiting logistical text detailing specific timelines, clothing requirements, and song guidelines...'}"
            </p>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex gap-3">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-indigo-900">
            <strong className="text-indigo-800">Contract Integrity Principle:</strong> Setting precise timelines and gear lists reduces musician disputes. These parameters are directly embedded into the Standard Performance Agreement (MoA) signature modal upon application approval.
          </div>
        </div>
      </div>
    </div>
  );
}
