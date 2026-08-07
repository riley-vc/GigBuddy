import { useState } from 'react';
import { MapPin, Pencil, Loader2, CalendarCheck2, PartyPopper } from 'lucide-react';
import RatingBadge from './RatingBadge.jsx';

export default function OrganizerProfilePage({ profile, contracts, musicians, onSaveProfile }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name || '');
  const [location, setLocation] = useState(profile.location || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const finishedEvents = contracts
    .filter((c) => c.status === 'completed' && (c.organizerId?._id || c.organizerId)?.toString() === profile._id?.toString())
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const musicianName = (c) => {
    const id = (c.musicianId?._id || c.musicianId)?.toString();
    return c.musicianId?.name || musicians.find((m) => (m._id || m.id)?.toString() === id)?.name || 'Musician';
  };

  const resetFields = () => {
    setName(profile.name || '');
    setLocation(profile.location || '');
    setBio(profile.bio || '');
    setError('');
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSaveProfile({ name: name.trim(), location: location.trim(), bio: bio.trim() });
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="organizer-profile-page" className="space-y-6">
      {/* ── Editable profile preview ──────────────────────────────────────── */}
      {!editing ? (
        <div id="organizer-profile-card" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-3.5">
            <img
              referrerPolicy="no-referrer"
              src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || '?')}&background=a21caf&color=fff&size=96`}
              alt=""
              className="w-16 h-16 rounded-xl object-cover border border-zinc-800 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-zinc-50 text-base truncate">{profile.name}</p>
              <p className="text-[11px] text-fuchsia-400 font-mono">Event Planner</p>
              {profile.location && (
                <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {profile.location}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <RatingBadge rating={profile.rating} count={profile.ratingCount} />
                <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                  <CalendarCheck2 className="w-3 h-3 text-emerald-400" /> {finishedEvents.length} event{finishedEvents.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
            <button
              id="edit-organizer-profile-btn"
              type="button"
              onClick={() => { resetFields(); setEditing(true); }}
              className="text-zinc-500 hover:text-fuchsia-400 p-2 rounded-lg hover:bg-zinc-950 cursor-pointer shrink-0"
              aria-label="Edit profile"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>

          {profile.bio ? (
            <p className="text-xs text-zinc-400 leading-relaxed">{profile.bio}</p>
          ) : (
            <p className="text-xs text-zinc-600 italic">No bio yet — tap the pencil to add one.</p>
          )}
        </div>
      ) : (
        <div id="organizer-profile-card-edit" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-zinc-50 text-sm">Edit Profile</h3>
            <div className="flex items-center gap-3">
              <RatingBadge rating={profile.rating} count={profile.ratingCount} />
              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                <CalendarCheck2 className="w-3 h-3 text-emerald-400" /> {finishedEvents.length}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="op-name" className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Name</label>
            <input
              id="op-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-fuchsia-500"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="op-location" className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Main Location</label>
            <input
              id="op-location"
              type="text"
              placeholder="e.g. BGC, Taguig"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-fuchsia-500 placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="op-bio" className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Bio</label>
            <textarea
              id="op-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell musicians about your events, venue, and what you look for in performers..."
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-fuchsia-500 placeholder:text-zinc-600 resize-none"
            />
          </div>

          {error && <p className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              id="op-cancel-btn"
              type="button"
              onClick={() => { resetFields(); setEditing(false); }}
              className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg py-2.5 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="op-save-btn"
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-zinc-50 rounded-lg py-2.5 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
            >
              {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* ── Finished Events ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="font-bold text-zinc-50 text-sm flex items-center gap-2">
          <PartyPopper className="w-4 h-4 text-fuchsia-400" /> Finished Events
        </h3>

        {finishedEvents.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
            <p className="text-sm text-zinc-400">No completed events yet.</p>
            <p className="text-xs text-zinc-600 mt-1">Events you've fully paid out will show up here.</p>
          </div>
        ) : (
          finishedEvents.map((c) => (
            <div key={c._id || c.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-zinc-50 text-sm truncate">{c.gigTitle}</p>
                <p className="text-[11px] text-zinc-500 truncate">{c.venueName} · {c.date}</p>
                <p className="text-[11px] text-zinc-500 truncate">with {musicianName(c)}{c.teamId ? ' (Band)' : ''}</p>
              </div>
              <span className="font-bold text-sm font-mono text-emerald-400 shrink-0">₱{(c.compensation || 0).toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
