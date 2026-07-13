import { useState } from 'react';
import {
  Calendar, Users, Briefcase, FileSignature, Check, X, Shield,
  FileText, ArrowRight, Pencil, MessageSquare, ChevronDown, ChevronUp,
} from 'lucide-react';

// ─── Genre / Instrument presets (mirrors GigCreatorForm) ─────────────────────
const GENRE_PRESETS = ['OPM', 'Bisrock', 'P-pop', 'Kundiman', 'Jazz-OPM', 'R&B', 'Hip-hop', 'Reggae', 'Rock', 'Pop', 'EDM'];
const INSTRUMENT_PRESETS = ['Electric Guitar', 'Bass Guitar', 'Acoustic Guitar', 'Drums', 'Keyboard', 'Vocals', 'Violin', 'Saxophone', 'DJ Setup'];

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

// ─── Edit Gig Modal ───────────────────────────────────────────────────────────
function EditGigModal({ gig, onSave, onClose }) {
  const toDateInput = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
  };

  const [title, setTitle]               = useState(gig.title || '');
  const [venueName, setVenueName]       = useState(gig.venueName || '');
  const [date, setDate]                 = useState(toDateInput(gig.date));
  const [soundcheckTime, setSoundcheck] = useState(gig.soundcheckTime || '');
  const [setTime, setSetTime]           = useState(gig.setTime || '');
  const [endTime, setEndTime]           = useState(gig.endTime || '');
  const [budget, setBudget]             = useState(gig.budget?.toString() || '');
  const [description, setDescription]  = useState(gig.description || '');
  const [genres, setGenres]             = useState(gig.genres || []);
  const [instruments, setInstruments]  = useState(gig.instruments || []);
  const [errors, setErrors]            = useState({});
  const [saving, setSaving]            = useState(false);

  const toggle = (list, setList, val) =>
    setList((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!venueName.trim()) e.venueName = 'Venue is required';
    if (!date) {
      e.date = 'Date is required';
    } else {
      const sel = new Date(date);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (sel <= today) e.date = 'Must be a future date';
    }
    if (!budget || Number(budget) <= 0) e.budget = 'Valid budget required';
    return Object.keys(e).length === 0 ? null : e;
  };

  const handleSave = async () => {
    const errs = validate();
    if (errs) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave(gig.id || gig._id, {
        title: title.trim(),
        venueName: venueName.trim(),
        date,
        soundcheckTime,
        setTime,
        endTime,
        budget: Number(budget),
        description: description.trim(),
        genres,
        instruments,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const field = 'w-full bg-zinc-950 border border-zinc-800 text-zinc-50 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-violet-500 transition-colors';
  const err   = 'text-xs text-amber-400 mt-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/20 flex items-center justify-center">
              <Pencil className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-50">Edit Event Details</p>
              <p className="text-[10px] text-zinc-500 font-mono">Only open gigs can be edited</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Gig Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} placeholder="e.g. Rooftop Jazz Night" />
            {errors.title && <p className={err}>{errors.title}</p>}
          </div>

          {/* Venue */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Venue</label>
            <input value={venueName} onChange={(e) => setVenueName(e.target.value)} className={field} placeholder="e.g. BGC Arts Center" />
            {errors.venueName && <p className={err}>{errors.venueName}</p>}
          </div>

          {/* Date + Budget */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Date</label>
              <input type="date" value={date} min={tomorrow()} onChange={(e) => setDate(e.target.value)} className={field} />
              {errors.date && <p className={err}>{errors.date}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Budget (₱)</label>
              <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className={field} placeholder="0" min="0" />
              {errors.budget && <p className={err}>{errors.budget}</p>}
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Soundcheck', val: soundcheckTime, set: setSoundcheck },
              { label: 'Set Start', val: setTime, set: setSetTime },
              { label: 'End', val: endTime, set: setEndTime },
            ].map(({ label, val, set }) => (
              <div key={label}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">{label}</label>
                <input type="time" value={val} onChange={(e) => set(e.target.value)} className={field} />
              </div>
            ))}
          </div>

          {/* Genres */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Genres</label>
            <div className="flex flex-wrap gap-1.5">
              {GENRE_PRESETS.map((g) => (
                <button key={g} type="button" onClick={() => toggle(genres, setGenres, g)}
                  className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${genres.includes(g) ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Instruments */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Instruments Needed</label>
            <div className="flex flex-wrap gap-1.5">
              {INSTRUMENT_PRESETS.map((i) => (
                <button key={i} type="button" onClick={() => toggle(instruments, setInstruments, i)}
                  className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${instruments.includes(i) ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className={`${field} resize-none`} placeholder="Event details..." />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 shrink-0 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-semibold transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-violet-600/20 cursor-pointer">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main OrganizerDashboard ──────────────────────────────────────────────────
export default function OrganizerDashboard({
  gigs,
  applications,
  contracts,
  conversations,
  onApproveApplication,
  onRejectApplication,
  onCancelGig,
  onOpenContract,
  onOpenPayment,
  onEditGig,
  onStartChat,
}) {
  const [activeTab, setActiveTab]   = useState('managed');
  const [editingGig, setEditingGig] = useState(null);

  // Stats
  const activeOpenCalls  = gigs.filter((g) => g.status === 'open').length;
  const pendingApps      = applications.filter((a) => a.status === 'pending').length;
  const confirmedBookings = gigs.filter((g) => g.status === 'filled').length;

  return (
    <div id="organizer-dashboard-wrapper" className="space-y-6">

      {/* Edit Gig Modal */}
      {editingGig && (
        <EditGigModal
          gig={editingGig}
          onSave={onEditGig}
          onClose={() => setEditingGig(null)}
        />
      )}

      {/* Metrics Row */}
      <div id="organizer-metrics-row" className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-3 sm:p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-zinc-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider block">Open Calls</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-50 block">{activeOpenCalls}</span>
            <span className="text-[10px] text-zinc-400 block hidden sm:block">Sourcing live musicians</span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-violet-600/10 border border-violet-500/10 items-center justify-center text-violet-400 hidden sm:flex">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-3 sm:p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-zinc-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider block">Pending</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 block">{pendingApps}</span>
            <span className="text-[10px] text-zinc-400 block hidden sm:block">Requires vetting &amp; approval</span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-amber-500/10 border border-amber-500/10 items-center justify-center text-amber-400 hidden sm:flex">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-3 sm:p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-zinc-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider block">Confirmed</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 block">{confirmedBookings}</span>
            <span className="text-[10px] text-zinc-400 block hidden sm:block">Escrow locked &amp; verified</span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/10 items-center justify-center text-emerald-400 hidden sm:flex">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div id="organizer-tabs-nav" className="flex border-b border-zinc-800">
        {[
          { key: 'managed',    label: `My Events (${gigs.length})` },
          { key: 'applicants', label: `Review Candidates (${pendingApps})`, dot: pendingApps > 0 },
          { key: 'contracts',  label: `MoA Agreements (${contracts.length})` },
        ].map(({ key, label, dot }) => (
          <button
            key={key}
            id={`btn-tab-${key}`}
            onClick={() => setActiveTab(key)}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors relative cursor-pointer ${
              activeTab === key
                ? 'border-violet-600 text-zinc-50'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {label}
            {dot && <span className="absolute top-2 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div id="organizer-tab-panel" className="space-y-4">

        {/* A. My Managed Gigs */}
        {activeTab === 'managed' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-100 text-sm">Managed Events Timeline</h3>
              <span className="text-[11px] font-mono text-zinc-500">Live from MongoDB</span>
            </div>

            {gigs.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center space-y-3">
                <p className="text-sm text-zinc-400">No gigs have been created yet.</p>
                <p className="text-xs text-zinc-500">Switch to "Publish Open Gig Call" to generate your first event!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gigs.map((gig) => {
                  const gigApps       = applications.filter((a) => (a.gigId?._id || a.gigId) === gig.id);
                  const activeAppCount = gigApps.filter((a) => a.status === 'pending').length;
                  const isOpen        = gig.status === 'open';

                  return (
                    <div key={gig.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono tracking-wider ${
                            gig.status === 'open'
                              ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                              : gig.status === 'filled'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}>
                            {gig.status === 'open' ? 'Sourcing Artists' : gig.status === 'filled' ? 'Booked & Locked' : 'Cancelled'}
                          </span>
                          <span className="font-mono font-bold text-emerald-400 text-sm">₱{gig.budget?.toLocaleString()}</span>
                        </div>

                        <div>
                          <h4 className="font-bold text-zinc-100 text-base line-clamp-1">{gig.title}</h4>
                          <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            <span>{gig.date ? new Date(gig.date).toLocaleDateString() : ''}</span>
                            <span className="text-zinc-600">|</span>
                            <span>{gig.venueName}</span>
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {(gig.instruments || []).map((i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-zinc-950 text-[9px] font-mono text-zinc-400 rounded">{i}</span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                        <span className="text-zinc-400">
                          <strong>{gigApps.length}</strong> applicants ({activeAppCount} pending)
                        </span>
                        <div className="flex gap-2">
                          {/* Edit — only for open gigs */}
                          {isOpen && (
                            <button
                              id={`edit-gig-${gig.id}`}
                              onClick={() => setEditingGig(gig)}
                              className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-violet-400 hover:border-violet-500/30 rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </button>
                          )}
                          {isOpen && (
                            <button
                              id={`cancel-gig-${gig.id}`}
                              onClick={() => onCancelGig(gig.id)}
                              className="px-2.5 py-1.5 bg-zinc-950 hover:bg-red-500/10 hover:text-red-400 text-zinc-500 rounded text-[11px] font-semibold transition-colors"
                            >
                              Cancel Call
                            </button>
                          )}
                          {activeAppCount > 0 && (
                            <button
                              id={`view-applicants-${gig.id}`}
                              onClick={() => setActiveTab('applicants')}
                              className="px-2.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-zinc-50 rounded text-[11px] font-semibold transition-all flex items-center gap-1"
                            >
                              Review <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* B. Review Applicants */}
        {activeTab === 'applicants' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-100 text-sm">Incoming Applications &amp; Pending Invitations</h3>
              <div className="flex gap-2 text-[10px] font-mono text-zinc-500">
                <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded">Self-Applied</span>
                <span className="px-2 py-0.5 bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 rounded">Organizer Invite</span>
              </div>
            </div>

            {pendingApps === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center space-y-2">
                <p className="text-sm text-zinc-400">No pending musician applications are available for review.</p>
                <p className="text-xs text-zinc-500">Wait for sessionists to apply to your open calls in the marketplace!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications
                  .filter((app) => app.status === 'pending')
                  .map((app) => {
                    const associatedGig = gigs.find((g) => g.id === (app.gigId?._id || app.gigId));

                    return (
                      <div key={app.id || app._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-800/80 transition-all flex flex-col md:flex-row gap-5 justify-between">
                        {/* Profile Details */}
                        <div className="flex gap-4 items-start flex-1">
                          <img
                            referrerPolicy="no-referrer"
                            src={app.musicianAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                            alt={app.musicianName}
                            className="w-12 h-12 rounded-xl object-cover border border-zinc-800 shrink-0"
                          />
                          <div className="space-y-2 flex-1">
                            <div>
                              <h4 className="font-bold text-zinc-100 text-base flex items-center gap-2 flex-wrap">
                                {app.musicianName || 'Unknown Musician'}
                                <span className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 text-[9px] font-mono font-normal text-violet-400 rounded">
                                  {app.instrument}
                                </span>
                                {app.initiatedBy === 'organizer' ? (
                                  <span className="px-2 py-0.5 bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 text-[9px] font-mono rounded">
                                    📩 Invited by You
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[9px] font-mono rounded">
                                    🎵 Self-Applied
                                  </span>
                                )}
                              </h4>
                              {associatedGig && (
                                <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                                  {app.initiatedBy === 'organizer' ? 'Invited for:' : 'Applying for:'}{' '}
                                  <strong className="text-zinc-300 font-sans font-medium">"{associatedGig.title}"</strong>
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {(app.skills || []).map((skill) => (
                                <span key={skill} className="px-2 py-0.5 bg-zinc-950 text-[10px] font-mono text-zinc-400 rounded">{skill}</span>
                              ))}
                            </div>

                            <div className="bg-zinc-950/60 p-3.5 rounded-lg border border-zinc-800 text-xs text-zinc-300 leading-relaxed italic">
                              "{app.coverNote || app.message || 'No cover note provided.'}"
                            </div>
                          </div>
                        </div>

                        {/* Decision Block */}
                        <div className="flex md:flex-col justify-end gap-2 shrink-0 border-t md:border-t-0 border-zinc-800 pt-3 md:pt-0">
                          {associatedGig && (
                            <div className="text-right hidden md:block mb-1.5">
                              <span className="text-[10px] text-zinc-500 block font-mono">Offer payout</span>
                              <span className="text-sm font-bold text-emerald-400 font-mono">₱{associatedGig.budget?.toLocaleString()}</span>
                            </div>
                          )}

                          {/* Start Chat — always available */}
                          <button
                            id={`start-chat-${app.id || app._id}`}
                            onClick={() => onStartChat(app, associatedGig)}
                            className="w-full md:w-auto px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-violet-500/40 text-zinc-300 hover:text-violet-300 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Chat
                          </button>

                          <div className="flex gap-2 w-full md:w-auto">
                            <button
                              id={`reject-app-${app.id || app._id}`}
                              onClick={() => onRejectApplication(app.id || app._id)}
                              className="flex-1 md:flex-none px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                            >
                              <X className="w-3.5 h-3.5 text-red-400" />
                              Decline
                            </button>
                            <button
                              id={`approve-app-${app.id || app._id}`}
                              onClick={() => onApproveApplication(app.id || app._id)}
                              className="flex-1 md:flex-none px-4 py-2 bg-violet-600 hover:bg-violet-500 text-zinc-50 rounded-lg text-xs font-semibold shadow-md shadow-violet-600/10 transition-all flex items-center justify-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve &amp; Draft MoA
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* C. MoA Contracts */}
        {activeTab === 'contracts' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-100 text-sm">Memorandums of Agreement &amp; Escrow States</h3>

            {contracts.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center space-y-1">
                <p className="text-sm text-zinc-400">No contracts exist yet.</p>
                <p className="text-xs text-zinc-500">Approve candidate applications to draft legally-binding performance agreements.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {contracts.map((contract) => {
                  const cid = contract.id || contract._id;
                  const st  = contract.status;
                  return (
                    <div key={cid} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className={`p-2.5 rounded-lg shrink-0 ${
                          st === 'funded' ? 'bg-emerald-500/10 text-emerald-400'
                          : st === 'completed' ? 'bg-violet-500/10 text-violet-400'
                          : 'bg-violet-500/10 text-violet-400'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-100 text-sm">{contract.gigTitle}</h4>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400 mt-1 font-mono">
                            <span>Venue: {contract.venueName}</span>
                            <span className="text-zinc-700">•</span>
                            <span>Compensation: <strong className="text-emerald-400">₱{contract.compensation?.toLocaleString()}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-zinc-800/60 pt-3.5 md:pt-0 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono ${
                          st === 'fully_signed'     ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : st === 'funded'         ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : st === 'completed'      ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                          : 'bg-zinc-800 text-zinc-500'
                        }`}>
                          {st === 'fully_signed'  ? '✍ Signed — Awaiting Deposit'
                          : st === 'funded'       ? '🔒 Funded — Escrow Active'
                          : st === 'completed'    ? '✅ Payment Released'
                          : 'Awaiting Signatures'}
                        </span>

                        <div className="flex gap-2 items-center">
                          <button
                            id={`open-contract-${cid}`}
                            onClick={() => onOpenContract(contract)}
                            className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                          >
                            <FileSignature className="w-3.5 h-3.5" />
                            View MoA
                          </button>

                          {st === 'fully_signed' && (
                            <button
                              id={`deposit-funds-${cid}`}
                              onClick={() => onOpenPayment(contract)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-amber-900/30"
                            >
                              Deposit Funds →
                            </button>
                          )}

                          {st === 'funded' && (
                            <button
                              id={`release-payment-${cid}`}
                              onClick={() => onOpenPayment(contract)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-900/30"
                            >
                              Release Payment →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
