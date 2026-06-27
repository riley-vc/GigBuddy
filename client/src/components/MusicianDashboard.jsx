import { useState } from 'react';
import { Calendar, DollarSign, Hourglass, CheckSquare, Music, Plus, X, ToggleLeft } from 'lucide-react';
import InvitationInbox from './InvitationInbox.jsx';

export default function MusicianDashboard({
  profile,
  gigs,
  applications,
  contracts,
  conversations,
  onUpdateAvailability,
  onAddBand,
  onRemoveBand,
  onOpenChat,
}) {
  const [newBandName, setNewBandName] = useState('');

  const myContracts     = contracts.filter((c) => {
    const mid = c.musicianId?._id || c.musicianId;
    return mid?.toString() === profile._id?.toString();
  });
  const fundedContracts   = myContracts.filter((c) => c.status === 'funded');
  const completedContracts = myContracts.filter((c) => c.status === 'completed');
  const upcomingCount     = fundedContracts.length + completedContracts.length;

  const myApplications = applications.filter(
    (a) => (a.musicianId?._id || a.musicianId) === profile._id
  );
  const pendingCount      = myApplications.filter((a) => a.status === 'pending').length;
  const escrowTotal       = fundedContracts.reduce((acc, c) => acc + (c.compensation || 0), 0);
  const totalEarned       = completedContracts.reduce((acc, c) => acc + (c.compensation || 0), 0);

  // Unread invitations count from conversations
  const myConversations = (conversations || []).filter(
    (c) => c.musicianId?.toString() === profile._id || c.musicianId === profile._id
  );
  const unreadInvites = myConversations.reduce((sum, c) => sum + (c.unreadMusician || 0), 0);

  const handleAddBandSubmit = (e) => {
    e.preventDefault();
    if (newBandName.trim()) {
      onAddBand(newBandName.trim());
      setNewBandName('');
    }
  };

  const cycleAvailability = (day, currentStatus) => {
    let nextStatus = 'available';
    if (currentStatus === 'available') nextStatus = 'busy';
    else if (currentStatus === 'busy') nextStatus = 'tentative';
    onUpdateAvailability(day, nextStatus);
  };

  return (
    <div id="musician-dashboard-wrapper" className="space-y-6">
      {/* Stats Row */}
      <div id="musician-stats-row" className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Contracted Gigs</span>
            <span className="text-3xl font-extrabold text-zinc-50 block">{upcomingCount}</span>
            <span className="text-[10px] text-zinc-400 block">Funded or completed</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-violet-600/10 border border-violet-500/10 flex items-center justify-center text-violet-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Active Applications</span>
            <span className="text-3xl font-extrabold text-amber-400 block">{pendingCount}</span>
            <span className="text-[10px] text-zinc-400 block">Sourcing reviews on planners</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/10 flex items-center justify-center text-amber-400">
            <Hourglass className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">In Escrow</span>
            <span className="text-3xl font-extrabold text-amber-400 block">₱{escrowTotal.toLocaleString()}</span>
            <span className="text-[10px] text-amber-400/80 block bg-amber-500/5 py-0.5 px-1.5 rounded inline-block">🔒 Funded &amp; held</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/10 flex items-center justify-center text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Total Earned</span>
            <span className="text-3xl font-extrabold text-emerald-400 block">₱{totalEarned.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-400/80 block bg-emerald-500/5 py-0.5 px-1.5 rounded inline-block">✅ Paid out</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Invitation Inbox + Contracts + Availability + Bands */}
        <div className="lg:col-span-7 space-y-6">

          {/* ── Invitation Inbox ─────────────────────────────────────────────── */}
          <InvitationInbox
            conversations={myConversations}
            applications={myApplications}
            onOpenChat={onOpenChat}
          />

          {/* ── My Contracts (funded + completed) ──────────────────────────── */}
          {(fundedContracts.length > 0 || completedContracts.length > 0) && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-md space-y-3">
              <h3 className="font-bold text-zinc-50 text-sm">My Contracts &amp; Payments</h3>
              <div className="space-y-2">
                {[...fundedContracts, ...completedContracts].map((c) => (
                  <div key={c._id || c.id} className="flex items-center justify-between gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-100 truncate">{c.gigTitle}</p>
                      <p className="text-[11px] font-mono text-zinc-500">{c.venueName} · {c.date}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-sm font-mono text-emerald-400">₱{c.compensation?.toLocaleString()}</span>
                      {c.status === 'funded' && (
                        <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase rounded">
                          🔒 In Escrow
                        </span>
                      )}
                      {c.status === 'completed' && (
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded">
                          ✅ PAID
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability Tracker */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
              <div>
                <h3 className="font-bold text-zinc-50 text-sm">Multi-Band Availability Tracker</h3>
                <p className="text-[11px] text-zinc-500">Click to toggle your weekly slots so band leaders can book you</p>
              </div>
              <ToggleLeft className="w-5 h-5 text-violet-400 shrink-0" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {Object.entries(profile.availability || {}).map(([day, status]) => (
                <button
                  id={`availability-day-${day}`}
                  key={day}
                  type="button"
                  onClick={() => cycleAvailability(day, status)}
                  className="p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center group transition-all active:scale-95 border-zinc-800 hover:border-zinc-700"
                >
                  <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                    {day.substring(0, 3)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    status === 'available'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : status === 'busy'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {status}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-zinc-800/60 text-[10px] text-zinc-500">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Available</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Busy</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Tentative</span>
            </div>
          </div>

          {/* Band Registry */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-md">
            <h3 className="font-bold text-zinc-50 text-sm mb-1">Live Band & Project Registry</h3>
            <p className="text-[11px] text-zinc-500 mb-4">Add projects you actively tour or play session work with</p>

            <div className="space-y-3">
              <form onSubmit={handleAddBandSubmit} className="flex gap-2">
                <input
                  id="input-add-band"
                  type="text"
                  placeholder="e.g. Chicago Jazz Collective"
                  value={newBandName}
                  onChange={(e) => setNewBandName(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-50 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-violet-500"
                />
                <button
                  id="btn-add-band"
                  type="submit"
                  className="px-3 bg-violet-600 hover:bg-violet-500 text-zinc-50 text-xs rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Registry
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-2">
                {(profile.bands || []).map((band) => (
                  <span key={band} className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 flex items-center gap-1.5">
                    <Music className="w-3 h-3 text-violet-400" />
                    <span>{band}</span>
                    <button
                      id={`remove-band-${band}`}
                      type="button"
                      onClick={() => onRemoveBand(band)}
                      className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(profile.bands || []).length === 0 && (
                  <span className="text-xs text-zinc-500 italic">No band projects listed. Add one above!</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Profile Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-md">
            <div className="flex gap-3.5 items-center pb-4 border-b border-zinc-800">
              <img
                referrerPolicy="no-referrer"
                src={profile.avatar}
                alt={profile.name}
                className="w-11 h-11 rounded-xl object-cover border border-zinc-800"
              />
              <div>
                <h4 className="font-extrabold text-zinc-50 text-base">{profile.name}</h4>
                <p className="text-xs text-violet-400 font-medium">{profile.primaryInstrument}</p>
              </div>
            </div>

            <div className="py-4 space-y-3.5 text-xs">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">Artist Bio</span>
                <p className="text-zinc-300 leading-relaxed italic">"{profile.bio}"</p>
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5">Verified Performance Skills</span>
                <div className="flex flex-wrap gap-1">
                  {(profile.skills || []).map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 rounded-md font-mono">
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 flex gap-2.5 items-start">
              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                <strong className="text-zinc-200">Payment Security Note:</strong> Complete all gigs as scheduled to receive prompt escrow settlement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
