import { useState, useEffect } from 'react';
import { X, Users, GripVertical, UserPlus, Search, Plus } from 'lucide-react';
import { getTeam } from '../api/teams.js';
import { getSessionSlots, createSessionSlot, deleteSessionSlot } from '../api/sessionSlots.js';

export default function SessionLineupBoard({ isOpen, onClose, contract, musicians = [] }) {
  const [roster, setRoster] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const gigId = contract?.gigId?._id || contract?.gigId;
  const teamId = contract?.teamId?._id || contract?.teamId;

  useEffect(() => {
    if (!isOpen || !gigId || !teamId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getTeam(teamId), getSessionSlots({ gigId })])
      .then(([team, gigSlots]) => {
        if (cancelled) return;
        setRoster(team.roster || []);
        setSlots(gigSlots);
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isOpen, gigId, teamId]);

  if (!isOpen) return null;

  const rosterIds = new Set(roster.map((m) => (m.musicianId?._id || m.musicianId)?.toString()));
  const assignedIds = new Set(slots.map((s) => (s.musicianId?._id || s.musicianId)?.toString()));

  const availableRoster = roster.filter((m) => !assignedIds.has((m.musicianId?._id || m.musicianId)?.toString()));

  const q = searchQuery.trim().toLowerCase();
  const subCandidates = q
    ? musicians.filter((m) => {
        const mid = (m._id || m.id)?.toString();
        if (assignedIds.has(mid) || rosterIds.has(mid)) return false;
        return m.name?.toLowerCase().includes(q) || (m.instruments || []).some((i) => i.toLowerCase().includes(q));
      })
    : [];

  const handleDragStart = (e, payload) => {
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Shared by both interaction paths: desktop drag-and-drop AND the tap-to-assign
  // fallback below. Native HTML5 drag-and-drop has no touch equivalent on iOS
  // Safari / Chrome Android, so a phone user can't actually drag a chip — the
  // "+" button on each chip calls this directly instead.
  const assignMusician = async (payload) => {
    setError('');
    try {
      const newSlot = await createSessionSlot({
        gigId,
        teamId,
        musicianId: payload.musicianId,
        instrument: payload.instrument || 'Musician',
        isSubstitute: payload.isSubstitute,
      });
      setSlots((prev) => [...prev, newSlot]);
      setSearchQuery('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    let payload;
    try {
      payload = JSON.parse(e.dataTransfer.getData('application/json'));
    } catch {
      return;
    }
    await assignMusician(payload);
  };

  const handleRemove = async (slotId) => {
    try {
      await deleteSessionSlot(slotId);
      setSlots((prev) => prev.filter((s) => (s._id || s.id) !== slotId));
    } catch (err) {
      setError(err.message);
    }
  };

  const getMusicianInfo = (id) => {
    const idStr = (id?._id || id || '').toString();
    return musicians.find((m) => (m._id || m.id || '').toString() === idStr) || { name: id?.name || 'Musician' };
  };

  return (
    <div id="lineup-modal-overlay" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div
        id="lineup-modal-container"
        className="w-full sm:max-w-3xl bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-50 text-lg">Gig Lineup</h3>
              <p className="text-xs text-zinc-400">{contract?.gigTitle} — drag, or tap + to add a player</p>
            </div>
          </div>
          <button
            id="close-lineup-modal"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-50 p-1.5 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12 text-zinc-500 text-sm">Loading lineup...</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Left: draggable sources */}
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Band Roster</h4>
                <div className="space-y-1.5">
                  {availableRoster.length === 0 && (
                    <p className="text-xs text-zinc-600 italic">Everyone's assigned, or roster's empty.</p>
                  )}
                  {availableRoster.map((m) => {
                    const mid = m.musicianId?._id || m.musicianId;
                    const info = getMusicianInfo(mid);
                    return (
                      <div
                        key={mid?.toString()}
                        id={`roster-chip-${mid}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, { musicianId: mid, instrument: m.instrument || (info.instruments || [])[0] || 'Musician', isSubstitute: false })}
                        className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 cursor-grab active:cursor-grabbing hover:border-violet-500/40 transition-colors"
                      >
                        <GripVertical className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                        <img
                          referrerPolicy="no-referrer"
                          src={info.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(info.name)}&background=27272a&color=fff&size=40`}
                          alt={info.name}
                          className="w-6 h-6 rounded-md object-cover border border-zinc-800 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-zinc-200 truncate">{info.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{m.instrument || (info.instruments || [])[0] || 'Member'}</p>
                        </div>
                        <button
                          id={`assign-roster-${mid}`}
                          type="button"
                          onClick={() => assignMusician({ musicianId: mid, instrument: m.instrument || (info.instruments || [])[0] || 'Musician', isSubstitute: false })}
                          className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-violet-600/10 border border-violet-500/20 text-violet-400 hover:bg-violet-600/20 transition-colors cursor-pointer"
                          aria-label={`Add ${info.name} to lineup`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
                  <UserPlus className="w-3 h-3" /> Session Subs
                </h4>
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    id="sub-search-input"
                    type="text"
                    placeholder="Search any musician to sub in..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {subCandidates.map((m) => {
                    const mid = m._id || m.id;
                    return (
                      <div
                        key={mid}
                        id={`sub-chip-${mid}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, { musicianId: mid, instrument: (m.instruments || [])[0] || 'Session Musician', isSubstitute: true })}
                        className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 cursor-grab active:cursor-grabbing hover:border-violet-500/40 transition-colors"
                      >
                        <GripVertical className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                        <img
                          referrerPolicy="no-referrer"
                          src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=27272a&color=fff&size=40`}
                          alt={m.name}
                          className="w-6 h-6 rounded-md object-cover border border-zinc-800 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-zinc-200 truncate">{m.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{(m.instruments || [])[0] || 'Musician'} · sub</p>
                        </div>
                        <button
                          id={`assign-sub-${mid}`}
                          type="button"
                          onClick={() => assignMusician({ musicianId: mid, instrument: (m.instruments || [])[0] || 'Session Musician', isSubstitute: true })}
                          className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-violet-600/10 border border-violet-500/20 text-violet-400 hover:bg-violet-600/20 transition-colors cursor-pointer"
                          aria-label={`Add ${m.name} to lineup`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: drop zone */}
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">This Gig's Lineup</h4>
              <div
                id="lineup-dropzone"
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`min-h-[240px] rounded-lg border-2 border-dashed p-3 space-y-2 transition-colors ${
                  dragOver ? 'border-violet-500 bg-violet-500/5' : 'border-zinc-800'
                }`}
              >
                {slots.length === 0 && (
                  <p className="text-xs text-zinc-600 italic text-center py-8">Drag someone here, or tap + next to their name.</p>
                )}
                {slots.map((s) => {
                  const sid = s._id || s.id;
                  const info = getMusicianInfo(s.musicianId);
                  return (
                    <div key={sid} className="flex items-center gap-2.5 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2">
                      <img
                        referrerPolicy="no-referrer"
                        src={info.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(info.name)}&background=7c3aed&color=fff&size=40`}
                        alt={info.name}
                        className="w-7 h-7 rounded-lg object-cover border border-zinc-800 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-zinc-200 truncate">{info.name}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{s.instrument}</p>
                      </div>
                      {s.isSubstitute && (
                        <span className="text-[9px] font-mono text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 px-1.5 py-0.5 rounded uppercase shrink-0">
                          Sub
                        </span>
                      )}
                      <button
                        id={`remove-slot-${sid}`}
                        type="button"
                        onClick={() => handleRemove(sid)}
                        className="text-zinc-500 hover:text-red-400 p-1 rounded cursor-pointer shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
              {error && (
                <p className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 px-3 py-2 rounded-lg mt-2">
                  {error}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
