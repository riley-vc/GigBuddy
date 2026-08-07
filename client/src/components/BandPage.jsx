import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  X,
  Check,
  Crown,
  UserMinus,
  Calendar,
  ChevronRight,
  Mail,
  ArrowLeft,
  Wallet,
  MapPin,
  Pencil,
  Loader2,
  CalendarCheck2,
} from 'lucide-react';
import { getTeam } from '../api/teams.js';
import RatingBadge from './RatingBadge.jsx';

const INSTRUMENT_PRESETS = [
  'Lead Vocals', 'Backing Vocals / BGV', 'Acoustic Guitar', 'Electric Guitar', 'Bass Guitar',
  'Keyboard / Keys', 'Piano', 'Synthesizer / Synth', 'Drum Kit', 'Percussion / Congas',
  'Violin', 'Cello', 'Trumpet', 'Saxophone', 'Flute', 'DJ / Turntables', 'Emcee / Host',
];

// ─── Editable musician profile preview ──────────────────────────────────────
function MusicianProfileCard({ profile, completedEventsCount, onSaveProfile }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name || '');
  const [location, setLocation] = useState(profile.location || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [instruments, setInstruments] = useState(profile.instruments || []);
  const [customInstrument, setCustomInstrument] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const resetFields = () => {
    setName(profile.name || '');
    setLocation(profile.location || '');
    setBio(profile.bio || '');
    setInstruments(profile.instruments || []);
    setCustomInstrument('');
    setError('');
  };

  const toggleInstrument = (i) => {
    setInstruments((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  };

  const addCustomInstrument = () => {
    const v = customInstrument.trim();
    if (v && !instruments.includes(v)) setInstruments((prev) => [...prev, v]);
    setCustomInstrument('');
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSaveProfile({ name: name.trim(), location: location.trim(), bio: bio.trim(), instruments });
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div id="musician-profile-card" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-start gap-3.5">
          <img
            referrerPolicy="no-referrer"
            src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || '?')}&background=7c3aed&color=fff&size=96`}
            alt=""
            className="w-16 h-16 rounded-xl object-cover border border-zinc-800 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-zinc-50 text-base truncate">{profile.name}</p>
            {profile.location && (
              <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {profile.location}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <RatingBadge rating={profile.rating} count={profile.ratingCount} />
              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                <CalendarCheck2 className="w-3 h-3 text-emerald-400" /> {completedEventsCount} event{completedEventsCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>
          <button
            id="edit-musician-profile-btn"
            type="button"
            onClick={() => { resetFields(); setEditing(true); }}
            className="text-zinc-500 hover:text-violet-400 p-2 rounded-lg hover:bg-zinc-950 cursor-pointer shrink-0"
            aria-label="Edit profile"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        {profile.instruments?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.instruments.map((i) => (
              <span key={i} className="text-[10px] font-mono text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded-full">
                {i}
              </span>
            ))}
          </div>
        )}

        {profile.bio ? (
          <p className="text-xs text-zinc-400 leading-relaxed">{profile.bio}</p>
        ) : (
          <p className="text-xs text-zinc-600 italic">No bio yet — tap the pencil to add one.</p>
        )}
      </div>
    );
  }

  return (
    <div id="musician-profile-card-edit" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-zinc-50 text-sm">Edit Profile</h3>
        <div className="flex items-center gap-3">
          <RatingBadge rating={profile.rating} count={profile.ratingCount} />
          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
            <CalendarCheck2 className="w-3 h-3 text-emerald-400" /> {completedEventsCount}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="mp-name" className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Name</label>
        <input
          id="mp-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-violet-500"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="mp-location" className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Location</label>
        <input
          id="mp-location"
          type="text"
          placeholder="e.g. Quezon City"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-violet-500 placeholder:text-zinc-600"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="mp-bio" className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Bio</label>
        <textarea
          id="mp-bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell organizers about your sound and experience..."
          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-violet-500 placeholder:text-zinc-600 resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Instruments</label>
        <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto p-2.5 bg-zinc-950 rounded-lg border border-zinc-800">
          {INSTRUMENT_PRESETS.map((i) => (
            <button
              key={i}
              id={`mp-instrument-${i.replace(/[^a-zA-Z0-9]/g, '')}`}
              type="button"
              onClick={() => toggleInstrument(i)}
              className={`text-[10px] font-mono px-2 py-1 rounded-full border cursor-pointer transition-colors ${
                instruments.includes(i)
                  ? 'bg-violet-600 border-violet-500 text-zinc-50'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
        {instruments.filter((i) => !INSTRUMENT_PRESETS.includes(i)).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {instruments.filter((i) => !INSTRUMENT_PRESETS.includes(i)).map((i) => (
              <span key={i} className="text-[10px] font-mono px-2 py-1 rounded-full border bg-violet-600 border-violet-500 text-zinc-50 flex items-center gap-1">
                {i}
                <button type="button" onClick={() => toggleInstrument(i)} className="cursor-pointer"><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            id="mp-custom-instrument"
            type="text"
            placeholder="Add another instrument/role"
            value={customInstrument}
            onChange={(e) => setCustomInstrument(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomInstrument(); } }}
            className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-violet-500 placeholder:text-zinc-600"
          />
          <button id="mp-add-custom-instrument-btn" type="button" onClick={addCustomInstrument} className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-3 text-xs font-semibold cursor-pointer">
            Add
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          id="mp-cancel-btn"
          type="button"
          onClick={() => { resetFields(); setEditing(false); }}
          className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg py-2.5 text-xs font-semibold cursor-pointer"
        >
          Cancel
        </button>
        <button
          id="mp-save-btn"
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-zinc-50 rounded-lg py-2.5 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
        >
          {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// ─── Create Band form ───────────────────────────────────────────────────────
function CreateBandForm({ onCreate, onCancel }) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Give your band a name.'); return; }
    setError('');
    setSaving(true);
    try {
      await onCreate({ name: name.trim(), bio: bio.trim() });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
      <h3 className="font-bold text-zinc-50 text-sm">Create Your Band</h3>
      <input
        id="create-band-name-input"
        type="text"
        placeholder="Band name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-violet-500 placeholder:text-zinc-600"
      />
      <textarea
        id="create-band-bio-input"
        placeholder="Short bio (optional)"
        rows={2}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-violet-500 placeholder:text-zinc-600 resize-none"
      />
      {error && <p className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 px-3 py-2 rounded-lg">{error}</p>}
      <div className="flex gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg py-2.5 text-xs font-semibold cursor-pointer">
            Cancel
          </button>
        )}
        <button
          id="submit-create-band-btn"
          type="submit"
          disabled={saving}
          className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-zinc-50 rounded-lg py-2.5 text-xs font-semibold cursor-pointer"
        >
          {saving ? 'Creating...' : 'Create Band'}
        </button>
      </div>
    </form>
  );
}

// ─── Invite-to-roster mini form ─────────────────────────────────────────────
function InviteRosterForm({ musicians, existingIds, onInvite, onCancel }) {
  const candidates = musicians.filter((m) => !existingIds.has((m._id || m.id)?.toString()));
  const [musicianId, setMusicianId] = useState(candidates[0]?._id || candidates[0]?.id || '');
  const [instrument, setInstrument] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!musicianId) { setError('Pick a musician.'); return; }
    setSaving(true);
    setError('');
    try {
      await onInvite(musicianId, instrument.trim());
      onCancel();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 space-y-2.5 mt-2">
      {candidates.length === 0 ? (
        <p className="text-xs text-zinc-500 italic">Everyone's already on the roster.</p>
      ) : (
        <>
          <select
            id="invite-roster-musician-select"
            value={musicianId}
            onChange={(e) => setMusicianId(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-violet-500"
          >
            {candidates.map((m) => (
              <option key={m._id || m.id} value={m._id || m.id}>{m.name}</option>
            ))}
          </select>
          <input
            id="invite-roster-instrument-input"
            type="text"
            placeholder="Instrument/role"
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-violet-500 placeholder:text-zinc-600"
          />
          {error && <p className="text-[11px] text-amber-400">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg py-2 text-[11px] font-semibold cursor-pointer">Cancel</button>
            <button id="submit-invite-roster-btn" type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-zinc-50 rounded-lg py-2 text-[11px] font-semibold cursor-pointer">
              {saving ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </>
      )}
    </form>
  );
}

// ─── Single band detail (roster + manage) ──────────────────────────────────
// ─── Payout split card for a single band-booked contract ───────────────────
function PayoutSplitCard({ contract, profile, musicians, onConfigureSplits, onRespondSplit }) {
  const payoutSplits = contract.payoutSplits || [];
  const hasConfigured = payoutSplits.some((s) => s.rawValue > 0);
  const [editing, setEditing] = useState(!hasConfigured);
  const [method, setMethod] = useState(hasConfigured ? payoutSplits[0].method : 'percentage');
  const [mode, setMode] = useState(contract.payoutMode || 'lump_sum');
  const [inputs, setInputs] = useState(() => {
    const init = {};
    payoutSplits.forEach((s) => {
      const sid = (s.musicianId?._id || s.musicianId || '').toString();
      init[sid] = hasConfigured ? String(s.rawValue) : '';
    });
    return init;
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [responding, setResponding] = useState(false);

  const myId = (profile._id || '').toString();
  const managerId = (contract.musicianId?._id || contract.musicianId || '').toString();
  const isPointOfContact = managerId === myId;
  const mySplit = payoutSplits.find((s) => (s.musicianId?._id || s.musicianId || '').toString() === myId);
  const totalSplits = payoutSplits.length;
  const approvedCount = payoutSplits.filter((s) => s.status === 'approved').length;
  const locked = contract.status !== 'pending_signatures';

  const getMusicianInfo = (id) => {
    const idStr = (id?._id || id || '').toString();
    return musicians.find((m) => (m._id || m.id)?.toString() === idStr) || { name: id?.name || 'Musician' };
  };

  const handleSave = async () => {
    setError('');
    const splits = payoutSplits.map((s) => {
      const sid = (s.musicianId?._id || s.musicianId || '').toString();
      return { musicianId: sid, rawValue: Number(inputs[sid] || 0) };
    });
    const sum = splits.reduce((acc, s) => acc + s.rawValue, 0);
    const expected = method === 'percentage' ? 100 : contract.compensation;
    if (sum !== expected) {
      const target = method === 'percentage' ? '100' : `₱${contract.compensation?.toLocaleString()}`;
      const got = method === 'percentage' ? sum : `₱${sum.toLocaleString()}`;
      setError(`${method === 'percentage' ? 'Percentages' : 'Amounts'} must add up to ${target} — currently ${got}`);
      return;
    }
    setSaving(true);
    const updated = await onConfigureSplits(contract._id, { method, splits, payoutMode: mode });
    setSaving(false);
    if (updated) setEditing(false);
  };

  const handleRespond = async (status) => {
    setResponding(true);
    await onRespondSplit(contract._id, myId, status);
    setResponding(false);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-zinc-50 truncate">{contract.gigTitle}</p>
          <p className="text-[11px] text-zinc-500">{contract.venueName} · ₱{contract.compensation?.toLocaleString()}</p>
        </div>
        {locked && (
          <span className="text-[9px] font-mono text-zinc-500 bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded uppercase shrink-0">Locked</span>
        )}
      </div>

      {isPointOfContact && editing && !locked ? (
        <div className="space-y-2.5">
          <div className="flex gap-2">
            {['lump_sum', 'per_member'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                  mode === m ? 'bg-violet-600 border-violet-600 text-zinc-50' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {m === 'lump_sum' ? 'Lump Sum to You' : 'Per-Member Split'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {['percentage', 'fixed'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                  method === m ? 'bg-zinc-800 border-zinc-700 text-zinc-50' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {m === 'percentage' ? 'By Percentage' : 'By Fixed ₱'}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {payoutSplits.map((s) => {
              const sid = (s.musicianId?._id || s.musicianId || '').toString();
              const info = getMusicianInfo(s.musicianId);
              return (
                <div key={sid} className="flex items-center gap-2.5">
                  <span className="text-xs text-zinc-300 flex-1 min-w-0 truncate">{info.name}{sid === myId ? ' (You)' : ''}</span>
                  <div className="relative shrink-0 w-24">
                    {method === 'fixed' && (
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">₱</span>
                    )}
                    <input
                      id={`band-split-input-${contract._id}-${sid}`}
                      type="number"
                      min="0"
                      value={inputs[sid] || ''}
                      onChange={(e) => setInputs((prev) => ({ ...prev, [sid]: e.target.value }))}
                      className={`w-full bg-zinc-950 border border-zinc-800 text-zinc-50 rounded-lg py-1.5 text-xs text-right focus:outline-none focus:border-violet-500 ${method === 'fixed' ? 'pl-5 pr-2' : 'pl-2 pr-5'}`}
                    />
                    {method === 'percentage' && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">%</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {error && <p className="text-[11px] text-amber-400 bg-amber-500/5 px-3 py-1.5 rounded border border-amber-500/10">{error}</p>}
          <button
            id={`save-band-split-${contract._id}`}
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-zinc-50 rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Split'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {payoutSplits.map((s) => {
            const sid = (s.musicianId?._id || s.musicianId || '').toString();
            const info = getMusicianInfo(s.musicianId);
            return (
              <div key={sid} className="flex items-center justify-between gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2">
                <span className="text-xs text-zinc-200 truncate">{info.name}{sid === myId ? ' (You)' : ''}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-emerald-400">₱{s.amount?.toLocaleString()}</span>
                  {s.status === 'approved' && (
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase">✓ Approved</span>
                  )}
                  {s.status === 'declined' && (
                    <span className="text-[9px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded uppercase">✗ Declined</span>
                  )}
                  {s.status === 'pending' && (
                    <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase">Pending</span>
                  )}
                </div>
              </div>
            );
          })}
          <p className="text-[10px] text-zinc-500">{approvedCount} of {totalSplits} member{totalSplits === 1 ? '' : 's'} approved</p>
          {isPointOfContact && !locked && (
            <button
              id={`edit-band-split-${contract._id}`}
              type="button"
              onClick={() => setEditing(true)}
              className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
            >
              Edit Split
            </button>
          )}
        </div>
      )}

      {!isPointOfContact && mySplit && mySplit.status === 'pending' && !locked && (
        <div className="border-t border-zinc-800 pt-3 flex gap-2">
          <button
            id={`decline-band-split-${contract._id}`}
            type="button"
            onClick={() => handleRespond('declined')}
            disabled={responding}
            className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg py-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            Decline
          </button>
          <button
            id={`approve-band-split-${contract._id}`}
            type="button"
            onClick={() => handleRespond('approved')}
            disabled={responding}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-zinc-50 rounded-lg py-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            Approve Share
          </button>
        </div>
      )}
    </div>
  );
}

function BandDetail({ team, profile, musicians, contracts = [], onBack, onInviteToRoster, onRemoveMember, onSetPayoutManager, onSetPayoutMode, onConfigureSplits, onRespondSplit }) {
  const [roster, setRoster] = useState(team.roster || []);
  const [showInvite, setShowInvite] = useState(false);
  const [loading, setLoading] = useState(!team.roster);
  const [payoutManagerId, setPayoutManagerId] = useState(
    (team.defaultPayoutManagerId?._id || team.defaultPayoutManagerId || '').toString()
  );
  const [reassigningId, setReassigningId] = useState(null);
  const [payoutMode, setPayoutMode] = useState(team.defaultPayoutMode || 'lump_sum');
  const [savingPayoutMode, setSavingPayoutMode] = useState(false);

  useEffect(() => {
    if (team.roster) { setRoster(team.roster); setLoading(false); return; }
    let cancelled = false;
    getTeam(team._id).then((full) => {
      if (cancelled) return;
      setRoster(full.roster || []);
      setPayoutManagerId((full.defaultPayoutManagerId?._id || full.defaultPayoutManagerId || '').toString());
      setPayoutMode(full.defaultPayoutMode || 'lump_sum');
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [team._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const myRow = roster.find((m) => (m.musicianId?._id || m.musicianId)?.toString() === profile._id?.toString());
  const isManager = myRow?.role === 'manager';
  const isPayoutManager = payoutManagerId === profile._id?.toString();
  const existingIds = new Set(roster.map((m) => (m.musicianId?._id || m.musicianId)?.toString()));

  // Gigs actually booked under this band — each gets its own payout-split
  // card so the point of contact can configure it and members can approve.
  const bandContracts = contracts.filter(
    (c) => (c.teamId?._id || c.teamId)?.toString() === team._id?.toString()
  );

  const handleRemove = async (teamMemberId) => {
    await onRemoveMember(teamMemberId);
    setRoster((prev) => prev.filter((m) => m._id !== teamMemberId));
  };

  const handleReassignPayoutManager = async (musicianId) => {
    setReassigningId(musicianId);
    try {
      await onSetPayoutManager(team._id, musicianId);
      setPayoutManagerId(musicianId);
    } finally {
      setReassigningId(null);
    }
  };

  const handleSetPayoutModeClick = async (mode) => {
    if (mode === payoutMode || savingPayoutMode) return;
    setSavingPayoutMode(true);
    try {
      await onSetPayoutMode(team._id, mode);
      setPayoutMode(mode);
    } finally {
      setSavingPayoutMode(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 shrink-0">
        <button id="back-to-band-list" onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-sm font-bold text-zinc-50 block">{team.name}</span>
          {team.location && <span className="text-[10px] text-zinc-500">{team.location}</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {team.bio && (
          <p className="text-xs text-zinc-400 italic bg-zinc-900/40 p-3 rounded-lg border border-zinc-800">"{team.bio}"</p>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Roster</h4>
            {isManager && (
              <button
                id="open-invite-roster-btn"
                type="button"
                onClick={() => setShowInvite((v) => !v)}
                className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Invite
              </button>
            )}
          </div>
          <p className="text-[11px] text-zinc-600 mb-2">
            The payout manager configures how a gig's payment gets split and can hand the role to another member.
          </p>

          {isPayoutManager ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 mb-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Default Payout Mode</span>
              </div>
              <p className="text-[11px] text-zinc-600">
                Starting mode for new bookings under this band — still adjustable per gig before signing.
              </p>
              <div className="flex gap-2">
                <button
                  id="band-payout-mode-lump-sum"
                  type="button"
                  onClick={() => handleSetPayoutModeClick('lump_sum')}
                  disabled={savingPayoutMode}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer disabled:opacity-50 ${
                    payoutMode === 'lump_sum'
                      ? 'bg-violet-600 border-violet-600 text-zinc-50'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Lump Sum to You
                </button>
                <button
                  id="band-payout-mode-per-member"
                  type="button"
                  onClick={() => handleSetPayoutModeClick('per_member')}
                  disabled={savingPayoutMode}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer disabled:opacity-50 ${
                    payoutMode === 'per_member'
                      ? 'bg-violet-600 border-violet-600 text-zinc-50'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Per-Member Split
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-zinc-500 mb-3 flex items-center gap-1.5">
              <Wallet className="w-3 h-3 text-zinc-600 shrink-0" />
              Default payout: <span className="text-zinc-300 font-medium">{payoutMode === 'lump_sum' ? 'Lump sum to point of contact' : 'Split per member'}</span>
            </p>
          )}

          {loading ? (
            <p className="text-xs text-zinc-600">Loading roster...</p>
          ) : (
            <div className="space-y-1.5">
              {roster.map((m) => {
                const mid = (m.musicianId?._id || m.musicianId)?.toString();
                const isMe = mid === profile._id?.toString();
                const isThisPayoutManager = mid === payoutManagerId;
                return (
                  <div key={mid} className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5">
                    <img
                      referrerPolicy="no-referrer"
                      src={m.musicianId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.musicianId?.name || '?')}&background=27272a&color=fff&size=40`}
                      alt=""
                      className="w-8 h-8 rounded-lg object-cover border border-zinc-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-zinc-200 truncate">{m.musicianId?.name}{isMe ? ' (You)' : ''}</p>
                      <p className="text-[11px] text-zinc-500 truncate">{m.instrument || (m.musicianId?.instruments || [])[0] || 'Member'}</p>
                    </div>
                    {m.role === 'manager' && (
                      <span className="text-[9px] font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded uppercase shrink-0 flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5" /> Manager
                      </span>
                    )}
                    {isThisPayoutManager ? (
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase shrink-0 flex items-center gap-1">
                        <Wallet className="w-2.5 h-2.5" /> Payout Mgr
                      </span>
                    ) : isPayoutManager && (
                      <button
                        id={`make-payout-manager-${mid}`}
                        type="button"
                        onClick={() => handleReassignPayoutManager(mid)}
                        disabled={reassigningId === mid}
                        className="text-[9px] font-mono text-zinc-500 hover:text-emerald-400 border border-zinc-800 hover:border-emerald-500/40 px-1.5 py-0.5 rounded uppercase shrink-0 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                      >
                        {reassigningId === mid ? 'Setting...' : 'Make Payout Mgr'}
                      </button>
                    )}
                    {isManager && m.role !== 'manager' && (
                      <button
                        id={`remove-member-${mid}`}
                        type="button"
                        onClick={() => handleRemove(m._id)}
                        className="text-zinc-500 hover:text-red-400 p-1.5 rounded cursor-pointer shrink-0"
                        aria-label="Remove member"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {showInvite && (
            <InviteRosterForm
              musicians={musicians}
              existingIds={existingIds}
              onInvite={onInviteToRoster}
              onCancel={() => setShowInvite(false)}
            />
          )}
        </div>

        {bandContracts.length > 0 && (
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">Payout Splits</h4>
            <p className="text-[11px] text-zinc-600 mb-2">
              Configure how each booked gig's fee is divided, and each member reviews and approves their own share.
            </p>
            <div className="space-y-3">
              {bandContracts.map((c) => (
                <PayoutSplitCard
                  key={c._id || c.id}
                  contract={c}
                  profile={profile}
                  musicians={musicians}
                  onConfigureSplits={onConfigureSplits}
                  onRespondSplit={onRespondSplit}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Create Session Band form ───────────────────────────────────────────────
function CreateSessionBandForm({ myGigs, myCreatedTeams, profile, onCreate, onCancel }) {
  const [name, setName] = useState('');
  const [gigId, setGigId] = useState(myGigs[0]?._id || myGigs[0]?.id || '');
  const [importTeamId, setImportTeamId] = useState('');
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [selected, setSelected] = useState({}); // musicianId -> { checked, instrument }
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!importTeamId) { setRoster([]); setSelected({}); return; }
    let cancelled = false;
    setRosterLoading(true);
    getTeam(importTeamId).then((full) => {
      if (cancelled) return;
      const others = (full.roster || []).filter(
        (m) => (m.musicianId?._id || m.musicianId)?.toString() !== profile._id?.toString()
      );
      setRoster(others);
      setSelected(
        Object.fromEntries(
          others.map((m) => {
            const mid = (m.musicianId?._id || m.musicianId)?.toString();
            return [mid, { checked: false, instrument: m.instrument || (m.musicianId?.instruments || [])[0] || '' }];
          })
        )
      );
      setRosterLoading(false);
    });
    return () => { cancelled = true; };
  }, [importTeamId, profile._id]);

  const toggleMember = (mid) => {
    setSelected((prev) => ({ ...prev, [mid]: { ...prev[mid], checked: !prev[mid].checked } }));
  };
  const setMemberInstrument = (mid, instrument) => {
    setSelected((prev) => ({ ...prev, [mid]: { ...prev[mid], instrument } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gigId) { setError('You need a booked gig to attach a session band to.'); return; }
    setSaving(true);
    setError('');
    try {
      const gig = myGigs.find((g) => (g._id || g.id) === gigId);
      const members = Object.entries(selected)
        .filter(([, v]) => v.checked)
        .map(([musicianId, v]) => ({ musicianId, instrument: v.instrument.trim() }));
      await onCreate({ name: name.trim() || `Session lineup for ${gig?.title || 'the gig'}`, gigId, members });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
      <h3 className="font-bold text-zinc-50 text-sm">Create a Session Band</h3>
      {myGigs.length === 0 ? (
        <p className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg">
          You need a booked gig first — session bands are tied to one event.
        </p>
      ) : (
        <select
          id="new-session-band-gig-select"
          value={gigId}
          onChange={(e) => setGigId(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-violet-500"
        >
          {myGigs.map((g) => (
            <option key={g._id || g.id} value={g._id || g.id}>{g.title}</option>
          ))}
        </select>
      )}
      <input
        id="new-session-band-name-input"
        type="text"
        placeholder="Name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-violet-500 placeholder:text-zinc-600"
      />

      {myCreatedTeams.length > 0 && (
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
            Import members from your band (optional)
          </label>
          <select
            id="import-band-roster-select"
            value={importTeamId}
            onChange={(e) => setImportTeamId(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-violet-500"
          >
            <option value="">None — build the lineup manually later</option>
            {myCreatedTeams.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>

          {importTeamId && (
            rosterLoading ? (
              <p className="text-xs text-zinc-600 mt-2">Loading roster...</p>
            ) : roster.length === 0 ? (
              <p className="text-xs text-zinc-600 mt-2">No other members on this band's roster.</p>
            ) : (
              <div className="space-y-1.5 mt-2">
                {roster.map((m) => {
                  const mid = (m.musicianId?._id || m.musicianId)?.toString();
                  const entry = selected[mid] || { checked: false, instrument: '' };
                  return (
                    <div key={mid} className="flex items-center gap-2.5 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2">
                      <input
                        id={`import-member-checkbox-${mid}`}
                        type="checkbox"
                        checked={entry.checked}
                        onChange={() => toggleMember(mid)}
                        className="w-4 h-4 rounded accent-violet-600 shrink-0 cursor-pointer"
                      />
                      <img
                        referrerPolicy="no-referrer"
                        src={m.musicianId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.musicianId?.name || '?')}&background=27272a&color=fff&size=40`}
                        alt=""
                        className="w-7 h-7 rounded-lg object-cover border border-zinc-800 shrink-0"
                      />
                      <span className="text-xs text-zinc-200 flex-1 truncate">{m.musicianId?.name}</span>
                      <input
                        id={`import-member-instrument-${mid}`}
                        type="text"
                        placeholder="Instrument/role"
                        value={entry.instrument}
                        onChange={(e) => setMemberInstrument(mid, e.target.value)}
                        disabled={!entry.checked}
                        className="w-28 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-lg py-1.5 px-2 text-[11px] focus:outline-none focus:border-violet-500 disabled:opacity-40 shrink-0"
                      />
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      )}

      {error && <p className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 px-3 py-2 rounded-lg">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg py-2.5 text-xs font-semibold cursor-pointer">Cancel</button>
        <button id="submit-create-session-band-btn" type="submit" disabled={saving || myGigs.length === 0} className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-zinc-50 rounded-lg py-2.5 text-xs font-semibold cursor-pointer">
          {saving ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function BandPage({
  profile,
  myTeams,
  myCreatedTeams = [],
  mySessionBands,
  musicians,
  myGigs,
  contracts = [],
  pendingTeamInvites = [],
  completedEventsCount = 0,
  onSaveProfile,
  onCreateTeam,
  onInviteToRoster,
  onRemoveTeamMember,
  onSetPayoutManager,
  onSetPayoutMode,
  onConfigureSplits,
  onRespondSplit,
  onCreateSessionBand,
  onRespondSessionBandInvite,
  onRemoveSessionBandMember,
  onRespondTeamInvite,
}) {
  const [detailTeam, setDetailTeam] = useState(null);
  const [showCreateBand, setShowCreateBand] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);

  if (detailTeam) {
    return (
      <BandDetail
        team={detailTeam}
        profile={profile}
        musicians={musicians}
        contracts={contracts}
        onBack={() => setDetailTeam(null)}
        onInviteToRoster={(musicianId, instrument) => onInviteToRoster(detailTeam._id, musicianId, instrument)}
        onRemoveMember={onRemoveTeamMember}
        onSetPayoutManager={onSetPayoutManager}
        onSetPayoutMode={onSetPayoutMode}
        onConfigureSplits={onConfigureSplits}
        onRespondSplit={onRespondSplit}
      />
    );
  }

  return (
    <div id="band-page" className="space-y-6">
      {/* ── Editable profile preview ──────────────────────────────────────── */}
      <MusicianProfileCard
        profile={profile}
        completedEventsCount={completedEventsCount}
        onSaveProfile={onSaveProfile}
      />

      {/* ── Pending Band Invitations ──────────────────────────────────────── */}
      {pendingTeamInvites.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-zinc-50 text-sm flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400" /> Band Invitations
          </h3>
          {pendingTeamInvites.map((inv) => (
            <div key={inv._id} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-2.5">
              <div>
                <p className="text-sm text-zinc-200">
                  <strong className="text-zinc-50">{inv.invitedBy?.name}</strong> invited you to join <strong className="text-zinc-50">{inv.teamId?.name}</strong>
                </p>
                {inv.instrument && <p className="text-[11px] text-zinc-500">as {inv.instrument}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  id={`accept-team-invite-${inv._id}`}
                  type="button"
                  onClick={() => onRespondTeamInvite(inv._id, 'accepted')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-zinc-50 rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Accept
                </button>
                <button
                  id={`decline-team-invite-${inv._id}`}
                  type="button"
                  onClick={() => onRespondTeamInvite(inv._id, 'declined')}
                  className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── My Bands ──────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-zinc-50 text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-400" /> My Bands
          </h3>
          {!showCreateBand && (
            <button
              id="show-create-band-btn"
              type="button"
              onClick={() => setShowCreateBand(true)}
              className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> New Band
            </button>
          )}
        </div>

        {showCreateBand && (
          <CreateBandForm
            onCreate={async (data) => { await onCreateTeam(data); setShowCreateBand(false); }}
            onCancel={() => setShowCreateBand(false)}
          />
        )}

        {myTeams.length === 0 && !showCreateBand && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
            <p className="text-sm text-zinc-400">You're not part of a band yet.</p>
            <p className="text-xs text-zinc-600 mt-1">Create one to start inviting musicians.</p>
          </div>
        )}

        {myTeams.map((t) => (
          <div
            key={t._id}
            id={`band-card-${t._id}`}
            onClick={() => setDetailTeam(t)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3.5 cursor-pointer hover:border-zinc-700 transition-colors"
          >
            <img
              referrerPolicy="no-referrer"
              src={t.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=7c3aed&color=fff&size=80`}
              alt={t.name}
              className="w-11 h-11 rounded-xl object-cover border border-zinc-800 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-zinc-50 text-sm truncate">{t.name}</p>
              <p className="text-[11px] text-zinc-500">{t.location || 'Band'}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
          </div>
        ))}
      </div>

      {/* ── Session Bands ─────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-zinc-50 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-fuchsia-400" /> My Session Bands
          </h3>
          {!showCreateSession && (
            <button
              id="show-create-session-band-btn"
              type="button"
              onClick={() => setShowCreateSession(true)}
              className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> New Session Band
            </button>
          )}
        </div>

        {showCreateSession && (
          <CreateSessionBandForm
            myGigs={myGigs}
            myCreatedTeams={myCreatedTeams}
            profile={profile}
            onCreate={async (data) => { await onCreateSessionBand(data); setShowCreateSession(false); }}
            onCancel={() => setShowCreateSession(false)}
          />
        )}

        {mySessionBands.length === 0 && !showCreateSession && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
            <p className="text-sm text-zinc-400">No session bands yet.</p>
            <p className="text-xs text-zinc-600 mt-1">Create one for a specific gig's lineup.</p>
          </div>
        )}

        {mySessionBands.map((b) => {
          const myRow = b.members.find((m) => (m.musicianId?._id || m.musicianId)?.toString() === profile._id?.toString());
          const isCreator = (b.createdBy?._id || b.createdBy)?.toString() === profile._id?.toString();
          const needsResponse = myRow && myRow.status === 'pending' && !isCreator;
          return (
            <div key={b._id} id={`session-band-card-${b._id}`} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
              <div>
                <p className="font-bold text-zinc-50 text-sm">{b.name}</p>
                <p className="text-[11px] text-zinc-500">{b.gigId?.title}</p>
              </div>
              <div className="space-y-1.5">
                {b.members.map((m) => {
                  const mid = (m.musicianId?._id || m.musicianId)?.toString();
                  return (
                    <div key={mid} className="flex items-center justify-between gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2">
                      <span className="text-xs text-zinc-300 truncate">{m.musicianId?.name}{mid === profile._id?.toString() ? ' (You)' : ''}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${
                          m.status === 'accepted' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' :
                          m.status === 'declined' ? 'text-red-400 bg-red-500/10 border border-red-500/20' :
                          'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                        }`}>{m.status}</span>
                        {isCreator && mid !== profile._id?.toString() && (
                          <button
                            id={`remove-session-member-${mid}`}
                            type="button"
                            onClick={() => onRemoveSessionBandMember(b._id, mid)}
                            className="text-zinc-500 hover:text-red-400 p-1 rounded cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {needsResponse && (
                <div className="flex gap-2">
                  <button
                    id={`accept-session-band-${b._id}`}
                    type="button"
                    onClick={() => onRespondSessionBandInvite(b._id, 'accepted')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-zinc-50 rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept
                  </button>
                  <button
                    id={`decline-session-band-${b._id}`}
                    type="button"
                    onClick={() => onRespondSessionBandInvite(b._id, 'declined')}
                    className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Decline
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
