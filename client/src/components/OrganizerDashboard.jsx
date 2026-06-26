import { useState } from 'react';
import { Calendar, Users, Briefcase, FileSignature, Check, X, Shield, FileText, ArrowRight } from 'lucide-react';

export default function OrganizerDashboard({
  gigs,
  applications,
  contracts,
  onApproveApplication,
  onRejectApplication,
  onCancelGig,
  onOpenContract,
}) {
  const [activeTab, setActiveTab] = useState('managed');

  // Stats
  const activeOpenCalls = gigs.filter((g) => g.status === 'open').length;
  const pendingApps = applications.filter((a) => a.status === 'pending').length;
  const confirmedBookings = gigs.filter((g) => g.status === 'filled').length;

  return (
    <div id="organizer-dashboard-wrapper" className="space-y-6">
      {/* Metrics Row */}
      <div id="organizer-metrics-row" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Active Open Calls</span>
            <span className="text-3xl font-extrabold text-zinc-50 block">{activeOpenCalls}</span>
            <span className="text-[10px] text-zinc-400 block">Sourcing live musicians</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-violet-600/10 border border-violet-500/10 flex items-center justify-center text-violet-400">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Pending Applications</span>
            <span className="text-3xl font-extrabold text-amber-400 block">{pendingApps}</span>
            <span className="text-[10px] text-zinc-400 block">Requires vetting & approval</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/10 flex items-center justify-center text-amber-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Confirmed Bookings</span>
            <span className="text-3xl font-extrabold text-emerald-400 block">{confirmedBookings}</span>
            <span className="text-[10px] text-zinc-400 block">Escrow locked & verified</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div id="organizer-tabs-nav" className="flex border-b border-zinc-800">
        {[
          { key: 'managed', label: `My Events (${gigs.length})` },
          { key: 'applicants', label: `Review Candidates (${pendingApps})`, dot: pendingApps > 0 },
          { key: 'contracts', label: `MoA Agreements (${contracts.length})` },
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
                  const gigApps = applications.filter((a) => (a.gigId?._id || a.gigId) === gig.id);
                  const activeAppCount = gigApps.filter((a) => a.status === 'pending').length;

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
                          {gig.status === 'open' && (
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
              <h3 className="font-semibold text-zinc-100 text-sm">Incoming Applications & Pending Invitations</h3>
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
                              Approve & Draft MoA
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
            <h3 className="font-semibold text-zinc-100 text-sm">Memorandums of Agreement & Escrow States</h3>

            {contracts.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center space-y-1">
                <p className="text-sm text-zinc-400">No contracts exist yet.</p>
                <p className="text-xs text-zinc-500">Approve candidate applications to draft legally-binding performance agreements.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {contracts.map((contract) => (
                  <div key={contract.id || contract._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 bg-violet-500/10 text-violet-400 rounded-lg shrink-0">
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

                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-zinc-800/60 pt-3.5 md:pt-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono ${
                        contract.status === 'fully_signed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : contract.status === 'completed'
                          ? 'bg-zinc-800 text-zinc-400'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {contract.status === 'fully_signed' ? 'Fully Signed (Escrow Active)'
                          : contract.status === 'completed' ? 'Archived (Completed)'
                          : 'Awaiting Signatures'}
                      </span>

                      <button
                        id={`open-contract-${contract.id || contract._id}`}
                        onClick={() => onOpenContract(contract)}
                        className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <FileSignature className="w-3.5 h-3.5" />
                        View MoA
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
