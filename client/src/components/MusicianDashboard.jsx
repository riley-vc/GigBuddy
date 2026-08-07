import { Calendar, DollarSign, Hourglass, CheckSquare, Star } from 'lucide-react';
import InvitationInbox from './InvitationInbox.jsx';

export default function MusicianDashboard({
  profile,
  gigs,
  applications,
  contracts,
  conversations,
  onOpenChat,
  onOpenContract,
  onOpenLineup,
  onRateGig,
  hasReviewed,
}) {
  const isPointOfContact = (c) =>
    (c.musicianId?._id || c.musicianId)?.toString() === profile._id?.toString();
  const myPayoutSplit = (c) =>
    (c.payoutSplits || []).find(
      (s) => (s.musicianId?._id || s.musicianId)?.toString() === profile._id?.toString()
    );
  // Band contracts pay per-member — a member should see THEIR share, not the
  // full band total (only the point of contact gets the whole compensation)
  const getMyAmount = (c) => (isPointOfContact(c) ? (c.compensation || 0) : (myPayoutSplit(c)?.amount || 0));

  const myContracts = contracts.filter((c) => isPointOfContact(c) || !!myPayoutSplit(c));
  const fundedContracts    = myContracts.filter((c) => c.status === 'funded');
  const partiallyReleasedContracts = myContracts.filter((c) => c.status === 'partially_released');
  const completedContracts = myContracts.filter((c) => c.status === 'completed');
  const pendingContracts   = myContracts.filter(
    (c) => c.status === 'pending_signatures' || c.status === 'fully_signed'
  );
  const upcomingCount     = fundedContracts.length + partiallyReleasedContracts.length + completedContracts.length;

  const myApplications = applications.filter(
    (a) => (a.musicianId?._id || a.musicianId) === profile._id
  );
  const pendingCount      = myApplications.filter((a) => a.status === 'pending').length;
  // "On the way" — still fully escrowed, or the second half still pending
  const escrowTotal       = [...fundedContracts, ...partiallyReleasedContracts].reduce((acc, c) => acc + getMyAmount(c), 0);
  const totalEarned       = completedContracts.reduce((acc, c) => acc + getMyAmount(c), 0);

  // Unread invitations count from conversations
  const myConversations = (conversations || []).filter(
    (c) => c.musicianId?.toString() === profile._id || c.musicianId === profile._id
  );
  const unreadInvites = myConversations.reduce((sum, c) => sum + (c.unreadMusician || 0), 0);

  return (
    <div id="musician-dashboard-wrapper" className="space-y-6">
      {/* Stats Row */}
      <div id="musician-stats-row" className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
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
            <span className="text-[10px] text-zinc-400 block">Waiting to hear back</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/10 flex items-center justify-center text-amber-400">
            <Hourglass className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">On the Way</span>
            <span className="text-3xl font-extrabold text-amber-400 block">₱{escrowTotal.toLocaleString()}</span>
            <span className="text-[10px] text-amber-400/80 block bg-amber-500/5 py-0.5 px-1.5 rounded inline-block">🔒 Locked in, coming soon</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/10 flex items-center justify-center text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Total Earned</span>
            <span className="text-3xl font-extrabold text-emerald-400 block">₱{totalEarned.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-400/80 block bg-emerald-500/5 py-0.5 px-1.5 rounded inline-block">✅ Already in your pocket</span>
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

          {/* ── Contracts In Progress (awaiting approval / signatures) ──────── */}
          {pendingContracts.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-md space-y-3">
              <h3 className="font-bold text-zinc-50 text-sm">Contracts In Progress</h3>
              <div className="space-y-2">
                {pendingContracts.map((c) => {
                  const poc = isPointOfContact(c);
                  const split = myPayoutSplit(c);
                  const needsMyApproval = !!split && split.status === 'pending' && !poc;
                  const amount = getMyAmount(c);
                  return (
                    <div key={c._id || c.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-100 truncate">{c.gigTitle}</p>
                        <p className="text-[11px] font-mono text-zinc-500">
                          {c.venueName} · ₱{amount.toLocaleString()}{c.teamId ? ' · Band' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {poc && c.teamId && onOpenLineup && (
                          <button
                            id={`open-lineup-${c._id || c.id}`}
                            type="button"
                            onClick={() => onOpenLineup(c)}
                            className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 transition-colors cursor-pointer"
                          >
                            Lineup
                          </button>
                        )}
                        <button
                          id={`open-contract-${c._id || c.id}`}
                          type="button"
                          onClick={() => onOpenContract(c)}
                          className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            needsMyApproval
                              ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                              : 'bg-violet-600 hover:bg-violet-500 text-zinc-50'
                          }`}
                        >
                          {needsMyApproval ? 'Review & Approve' : poc ? 'Configure & Sign' : 'View Contract'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── My Contracts (funded + partially released + completed) ─────── */}
          {(fundedContracts.length > 0 || partiallyReleasedContracts.length > 0 || completedContracts.length > 0) && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-md space-y-3">
              <h3 className="font-bold text-zinc-50 text-sm">My Gigs &amp; Pay</h3>
              <div className="space-y-2">
                {[...fundedContracts, ...partiallyReleasedContracts, ...completedContracts].map((c) => {
                  const poc = isPointOfContact(c);
                  const rated = hasReviewed ? hasReviewed(c._id || c.id) : true;
                  return (
                    <div
                      key={c._id || c.id}
                      onClick={() => onOpenContract(c)}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-100 truncate">{c.gigTitle}</p>
                        <p className="text-[11px] font-mono text-zinc-500">
                          {c.venueName} · {c.date}{c.teamId ? ' · Band' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        {poc && c.teamId && onOpenLineup && (
                          <button
                            id={`open-lineup-${c._id || c.id}`}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onOpenLineup(c); }}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 transition-colors cursor-pointer"
                          >
                            Lineup
                          </button>
                        )}
                        <span className="font-bold text-sm font-mono text-emerald-400">₱{getMyAmount(c).toLocaleString()}</span>
                        {c.status === 'funded' && (
                          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase rounded">
                            🔒 Locked In
                          </span>
                        )}
                        {c.status === 'partially_released' && (
                          <span className="px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-bold uppercase rounded">
                            50% Paid
                          </span>
                        )}
                        {c.status === 'completed' && (
                          <>
                            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded">
                              ✅ You Got Paid
                            </span>
                            {onRateGig && !rated && (
                              <button
                                id={`rate-gig-${c._id || c.id}`}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onRateGig(c); }}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
                              >
                                <Star className="w-3 h-3" /> Rate
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
                <strong className="text-zinc-200">Getting paid:</strong> Just show up and play the gig — your payment unlocks automatically, no extra steps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
