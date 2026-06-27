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
        <div className="card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block">Contracted Gigs</span>
            <span className="text-3xl font-extrabold text-gray-900 block">{upcomingCount}</span>
            <span className="text-[10px] text-gray-400 block">Funded or completed</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block">Active Applications</span>
            <span className="text-3xl font-extrabold text-amber-500 block">{pendingCount}</span>
            <span className="text-[10px] text-gray-400 block">Sourcing reviews on planners</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
            <Hourglass className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block">In Escrow</span>
            <span className="text-3xl font-extrabold text-amber-500 block">₱{escrowTotal.toLocaleString()}</span>
            <span className="text-[10px] text-amber-600 block bg-amber-50 py-0.5 px-1.5 rounded inline-block">🔒 Funded &amp; held</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block">Total Earned</span>
            <span className="text-3xl font-extrabold text-emerald-600 block">₱{totalEarned.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-600 block bg-emerald-50 py-0.5 px-1.5 rounded inline-block">✅ Paid out</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
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
            <div className="card p-5 space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">My Contracts &amp; Payments</h3>
              <div className="space-y-2">
                {[...fundedContracts, ...completedContracts].map((c) => (
                  <div key={c._id || c.id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{c.gigTitle}</p>
                      <p className="text-[11px] font-mono text-gray-500">{c.venueName} · {c.date}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-sm font-mono text-emerald-600">₱{c.compensation?.toLocaleString()}</span>
                      {c.status === 'funded' && (
                        <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-bold uppercase rounded">
                          🔒 In Escrow
                        </span>
                      )}
                      {c.status === 'completed' && (
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold uppercase rounded">
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
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Multi-Band Availability Tracker</h3>
                <p className="text-[11px] text-gray-500">Click to toggle your weekly slots so band leaders can book you</p>
              </div>
              <ToggleLeft className="w-5 h-5 text-indigo-600 shrink-0" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {Object.entries(profile.availability || {}).map(([day, status]) => (
                <button
                  id={`availability-day-${day}`}
                  key={day}
                  type="button"
                  onClick={() => cycleAvailability(day, status)}
                  className="p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center group transition-all active:scale-95 border-gray-200 hover:border-gray-300 bg-white"
                >
                  <span className="text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-wider">
                    {day.substring(0, 3)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    status === 'available'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : status === 'busy'
                      ? 'bg-red-50 text-red-600 border border-red-100'
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {status}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-gray-100 text-[10px] text-gray-500">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Available</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Busy</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Tentative</span>
            </div>
          </div>

          {/* Band Registry */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-1">Live Band & Project Registry</h3>
            <p className="text-[11px] text-gray-500 mb-4">Add projects you actively tour or play session work with</p>

            <div className="space-y-3">
              <form onSubmit={handleAddBandSubmit} className="flex gap-2">
                <input
                  id="input-add-band"
                  type="text"
                  placeholder="e.g. Chicago Jazz Collective"
                  value={newBandName}
                  onChange={(e) => setNewBandName(e.target.value)}
                  className="flex-1 bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  id="btn-add-band"
                  type="submit"
                  className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Registry
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-2">
                {(profile.bands || []).map((band) => (
                  <span key={band} className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 flex items-center gap-1.5">
                    <Music className="w-3 h-3 text-indigo-600" />
                    <span>{band}</span>
                    <button
                      id={`remove-band-${band}`}
                      type="button"
                      onClick={() => onRemoveBand(band)}
                      className="text-gray-400 hover:text-red-500 p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(profile.bands || []).length === 0 && (
                  <span className="text-xs text-gray-400 italic">No band projects listed. Add one above!</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Profile Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card p-5">
            <div className="flex gap-3.5 items-center pb-4 border-b border-gray-100">
              <img
                referrerPolicy="no-referrer"
                src={profile.avatar}
                alt={profile.name}
                className="w-11 h-11 rounded-xl object-cover border border-gray-200"
              />
              <div>
                <h4 className="font-extrabold text-gray-900 text-base">{profile.name}</h4>
                <p className="text-xs text-indigo-600 font-medium">{profile.primaryInstrument}</p>
              </div>
            </div>

            <div className="py-4 space-y-3.5 text-xs">
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-1">Artist Bio</span>
                <p className="text-gray-700 leading-relaxed italic">"{profile.bio}"</p>
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-1.5">Verified Performance Skills</span>
                <div className="flex flex-wrap gap-1">
                  {(profile.skills || []).map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-gray-50 border border-gray-200 text-[10px] text-gray-600 rounded-md font-mono">
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 flex gap-2.5 items-start">
              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-600 leading-relaxed">
                <strong className="text-gray-800">Payment Security Note:</strong> Complete all gigs as scheduled to receive prompt escrow settlement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
