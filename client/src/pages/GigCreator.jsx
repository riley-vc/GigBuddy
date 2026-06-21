import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createGig } from '../api/gigs';

const GENRE_OPTIONS = [
  'OPM', 'Kundiman', 'Bisrock', 'Original Pilipino Music',
  'Jazz', 'Blues', 'Rock', 'Indie Rock', 'Alternative', 'Pop', 'R&B',
  'Soul', 'Electronic', 'Ambient', 'Folk', 'Acoustic', 'Country',
  'Reggae', 'Hip-Hop', 'Lo-fi', 'Experimental', 'Classical', 'Bossa Nova',
];

const INSTRUMENT_OPTIONS = [
  'Guitar', 'Bass', 'Drums', 'Piano', 'Keys', 'Vocals', 'Saxophone',
  'Trumpet', 'Violin', 'Cello', 'Acoustic Guitar', 'Synthesizer',
  'Upright Bass', 'Ukulele', 'Bandurria', 'Kulintang', 'Rondalla',
  'Laptop / DJ Setup', 'Full Band', 'String Quartet',
];

function TagSelector({ label, options, selected, onToggle }) {
  return (
    <div>
      <label className="input-label">{label}</label>
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                active
                  ? 'bg-violet-500/20 border-violet-500/60 text-violet-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeader({ num, title }) {
  return (
    <div className="flex items-center gap-3 pb-5 border-b border-zinc-800">
      <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-xs flex-shrink-0">
        {num}
      </div>
      <h2 className="text-base font-semibold text-zinc-50">{title}</h2>
    </div>
  );
}

export default function GigCreator() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    venue: '',
    location: '',
    date: '',
    soundcheckTime: '',
    startTime: '',
    endTime: '',
    budget: '',
    genres: [],
    instruments: [],
    backlineProvided: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const toggleTag = (key, val) =>
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(val)
        ? prev[key].filter((x) => x !== val)
        : [...prev[key], val],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createGig({
        organizerId: currentUser._id,
        title: form.title,
        description: form.description,
        venue: form.venue,
        location: form.location,
        date: form.date,
        soundcheckTime: form.soundcheckTime,
        startTime: form.startTime,
        endTime: form.endTime,
        budget: Number(form.budget),
        requirements: {
          genres: form.genres,
          instruments: form.instruments,
          backlineProvided: form.backlineProvided,
        },
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create gig. Is the server running?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-50 tracking-tight">Post a Gig</h1>
        <p className="text-zinc-400 mt-1">
          Fill in the details and publish your open call for musicians.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── 1. Event Details ─────────────────────────── */}
        <div className="card p-6 space-y-5">
          <SectionHeader num="1" title="Event Details" />

          <div>
            <label className="input-label" htmlFor="title">
              Event Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              className="input"
              placeholder="e.g. OPM Acoustic Night sa Saguijo"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="input-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={4}
              className="input resize-none"
              placeholder="Tell musicians about the event, audience, vibe, and what you're looking for…"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label" htmlFor="venue">
                Venue Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="venue"
                type="text"
                className="input"
                placeholder="e.g. Saguijo Café + Bar Works"
                value={form.venue}
                onChange={(e) => set('venue', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="input-label" htmlFor="location">City / Location</label>
              <input
                id="location"
                type="text"
                className="input"
                placeholder="e.g. Poblacion, Makati"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── 2. Schedule ──────────────────────────────── */}
        <div className="card p-6 space-y-5">
          <SectionHeader num="2" title="Schedule & Timeline" />

          <div>
            <label className="input-label" htmlFor="date">
              Gig Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="date"
              type="date"
              className="input"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="input-label" htmlFor="soundcheck">Soundcheck</label>
              <input id="soundcheck" type="time" className="input" value={form.soundcheckTime} onChange={(e) => set('soundcheckTime', e.target.value)} />
            </div>
            <div>
              <label className="input-label" htmlFor="startTime">
                Set Start <span className="text-rose-500">*</span>
              </label>
              <input id="startTime" type="time" className="input" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
            </div>
            <div>
              <label className="input-label" htmlFor="endTime">Set End</label>
              <input id="endTime" type="time" className="input" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── 3. Talent Fee ────────────────────────────── */}
        <div className="card p-6 space-y-5">
          <SectionHeader num="3" title="Talent Fee" />

          <div>
            <label className="input-label" htmlFor="budget">
              Amount (PHP) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold select-none">₱</span>
              <input
                id="budget"
                type="number"
                min="0"
                step="500"
                className="input pl-8"
                placeholder="0"
                value={form.budget}
                onChange={(e) => set('budget', e.target.value)}
                required
              />
            </div>
            {form.budget && (
              <p className="text-sm text-emerald-400 mt-2 font-medium">
                Offering: ₱{Number(form.budget).toLocaleString()} PHP
              </p>
            )}
          </div>
        </div>

        {/* ── 4. Requirements ──────────────────────────── */}
        <div className="card p-6 space-y-6">
          <SectionHeader num="4" title="Requirements" />

          <TagSelector
            label="Preferred Genres"
            options={GENRE_OPTIONS}
            selected={form.genres}
            onToggle={(val) => toggleTag('genres', val)}
          />

          <TagSelector
            label="Instruments / Lineup Needed"
            options={INSTRUMENT_OPTIONS}
            selected={form.instruments}
            onToggle={(val) => toggleTag('instruments', val)}
          />

          {/* Backline toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800">
            <div>
              <p className="font-medium text-zinc-200 text-sm">Backline / Equipment Provided</p>
              <p className="text-xs text-zinc-500 mt-0.5">PA, drums, amps, monitors supplied by the venue</p>
            </div>
            <button
              type="button"
              onClick={() => set('backlineProvided', !form.backlineProvided)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 flex-shrink-0 ${
                form.backlineProvided ? 'bg-violet-600' : 'bg-zinc-700'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                form.backlineProvided ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="card border-rose-500/30 bg-rose-500/5 p-4 text-rose-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <button type="button" onClick={() => navigate('/')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary px-8">
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publishing…
              </span>
            ) : '🚀 Publish Gig'}
          </button>
        </div>
      </form>
    </main>
  );
}
