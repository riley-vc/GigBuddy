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
  onOpenPayment,
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
        <div className="card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block">Active Open Calls</span>
            <span className="text-3xl font-extrabold text-gray-900 block">{activeOpenCalls}</span>
            <span className="text-[10px] text-gray-400 block">Sourcing live musicians</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block">Pending Applications</span>
            <span className="text-3xl font-extrabold text-amber-500 block">{pendingApps}</span>
            <span className="text-[10px] text-gray-400 block">Requires vetting & approval</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block">Confirmed Bookings</span>
            <span className="text-3xl font-extrabold text-emerald-600 block">{confirmedBookings}</span>
            <span className="text-[10px] text-gray-400 block">Escrow locked & verified</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div id="organizer-tabs-nav" className="flex border-b border-gray-200">
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
                ? 'border-indigo-600 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-800'
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
              <h3 className="font-semibold text-gray-900 text-sm">Managed Events Timeline</h3>
              <span className="text-[11px] font-mono text-gray-400">Live from MongoDB</span>
            </div>

            {gigs.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-3 shadow-sm">
                <p className="text-sm text-gray-500">No gigs have been created yet.</p>
                <p className="text-xs text-gray-400">Switch to "Publish Open Gig Call" to generate your first event!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gigs.map((gig) => {
                  const gigApps = applications.filter((a) => (a.gigId?._id || a.gigId) === gig.id);
                  const activeAppCount = gigApps.filter((a) => a.status === 'pending').length;

                  return (
                    <div key={gig.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors flex flex-col justify-between space-y-4 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono tracking-wider ${
                            gig.status === 'open'
                              ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                              : gig.status === 'filled'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}>
                            {gig.status === 'open' ? 'Sourcing Artists' : gig.status === 'filled' ? 'Booked & Locked' : 'Cancelled'}
                          </span>
                          <span className="font-mono font-bold text-emerald-600 text-sm">₱{gig.budget?.toLocaleString()}</span>
                        </div>

                        <div>
                          <h4 className="font-bold text-gray-900 text-base line-clamp-1">{gig.title}</h4>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{gig.date ? new Date(gig.date).toLocaleDateString() : ''}</span>
                            <span className="text-gray-300">|</span>
                            <span>{gig.venueName}</span>
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {(gig.instruments || []).map((i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-gray-50 border border-gray-100 text-[9px] font-mono text-gray-500 rounded">{i}</span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          <strong className="text-gray-700">{gigApps.length}</strong> applicants ({activeAppCount} pending)
                        </span>
                        <div className="flex gap-2">
                          {gig.status === 'open' && (
                            <button
                              id={`cancel-gig-${gig.id}`}
                              onClick={() => onCancelGig(gig.id)}
                              className="px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-100 hover:text-red-600 text-gray-500 rounded text-[11px] font-semibold transition-colors"
                            >
                              Cancel Call
                            </button>
                          )}
                          {activeAppCount > 0 && (
                            <button
                              id={`view-applicants-${gig.id}`}
                              onClick={() => setActiveTab('applicants')}
                              className="btn-primary px-2.5 py-1.5 text-[11px] rounded"
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
              <h3 className="font-semibold text-gray-900 text-sm">Incoming Applications & Pending Invitations</h3>
              <div className="flex gap-2 text-[10px] font-mono text-gray-500">
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded">Self-Applied</span>
                <span className="px-2 py-0.5 bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100 rounded">Organizer Invite</span>
              </div>
            </div>

            {pendingApps === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-2 shadow-sm">
                <p className="text-sm text-gray-500">No pending musician applications are available for review.</p>
                <p className="text-xs text-gray-400">Wait for sessionists to apply to your open calls in the marketplace!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications
                  .filter((app) => app.status === 'pending')
                  .map((app) => {
                    const associatedGig = gigs.find((g) => g.id === (app.gigId?._id || app.gigId));

                    return (
                      <div key={app.id || app._id} className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 hover:border-gray-300 transition-all flex flex-col md:flex-row gap-5 justify-between">
                        {/* Profile Details */}
                        <div className="flex gap-4 items-start flex-1">
                          <img
                            referrerPolicy="no-referrer"
                            src={app.musicianAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                            alt={app.musicianName}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                          />
                          <div className="space-y-2 flex-1">
                           <div>
                              <h4 className="font-bold text-gray-900 text-base flex items-center gap-2 flex-wrap">
                                {app.musicianName || 'Unknown Musician'}
                                <span className="px-2 py-0.5 bg-gray-50 border border-gray-200 text-[9px] font-mono font-normal text-indigo-600 rounded">
                                  {app.instrument}
                                </span>
                                {app.initiatedBy === 'organizer' ? (
                                  <span className="px-2 py-0.5 bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100 text-[9px] font-mono rounded">
                                    📩 Invited by You
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] font-mono rounded">
                                    🎵 Self-Applied
                                  </span>
                                )}
                              </h4>
                              {associatedGig && (
                                <p className="text-[11px] font-mono text-gray-500 mt-0.5">
                                  {app.initiatedBy === 'organizer' ? 'Invited for:' : 'Applying for:'}{' '}
                                  <strong className="text-gray-700 font-sans font-medium">"{associatedGig.title}"</strong>
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {(app.skills || []).map((skill) => (
                                <span key={skill} className="px-2 py-0.5 bg-gray-50 border border-gray-100 text-[10px] font-mono text-gray-500 rounded">{skill}</span>
                              ))}
                            </div>

                            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 text-xs text-gray-600 leading-relaxed italic">
                              "{app.coverNote || app.message || 'No cover note provided.'}"
                            </div>
                          </div>
                        </div>

                        {/* Decision Block */}
                        <div className="flex md:flex-col justify-end gap-2 shrink-0 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
                          {associatedGig && (
                            <div className="text-right hidden md:block mb-1.5">
                              <span className="text-[10px] text-gray-500 block font-mono">Offer payout</span>
                              <span className="text-sm font-bold text-emerald-600 font-mono">₱{associatedGig.budget?.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex gap-2 w-full md:w-auto">
                            <button
                              id={`reject-app-${app.id || app._id}`}
                              onClick={() => onRejectApplication(app.id || app._id)}
                              className="btn-secondary flex-1 md:flex-none px-3.5 py-2 text-xs flex items-center justify-center gap-1.5"
                            >
                              <X className="w-3.5 h-3.5 text-red-500" />
                              Decline
                            </button>
                            <button
                              id={`approve-app-${app.id || app._id}`}
                              onClick={() => onApproveApplication(app.id || app._id)}
                              className="btn-primary flex-1 md:flex-none px-4 py-2 text-xs flex items-center justify-center gap-1.5"
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
            <h3 className="font-semibold text-gray-900 text-sm">Memorandums of Agreement & Escrow States</h3>

            {contracts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-1 shadow-sm">
                <p className="text-sm text-gray-500">No contracts exist yet.</p>
                <p className="text-xs text-gray-400">Approve candidate applications to draft legally-binding performance agreements.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {contracts.map((contract) => {
                  const cid = contract.id || contract._id;
                  const st  = contract.status;
                  return (
                    <div key={cid} className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className={`p-2.5 rounded-lg shrink-0 ${
                          st === 'funded' ? 'bg-emerald-50 text-emerald-600'
                          : st === 'completed' ? 'bg-indigo-50 text-indigo-600'
                          : 'bg-indigo-50 text-indigo-600'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">{contract.gigTitle}</h4>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 mt-1 font-mono">
                            <span>Venue: {contract.venueName}</span>
                            <span className="text-gray-300">•</span>
                            <span>Compensation: <strong className="text-emerald-600">₱{contract.compensation?.toLocaleString()}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-gray-100 pt-3.5 md:pt-0 flex-wrap">
                        {/* Status badge */}
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono ${
                          st === 'fully_signed'     ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : st === 'funded'         ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : st === 'completed'      ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                          : 'bg-gray-50 text-gray-500 border border-gray-200'
                        }`}>
                          {st === 'fully_signed'  ? '✍ Signed — Awaiting Deposit'
                          : st === 'funded'       ? '🔒 Funded — Escrow Active'
                          : st === 'completed'    ? '✅ Payment Released'
                          : 'Awaiting Signatures'}
                        </span>

                        <div className="flex gap-2 items-center">
                          {/* View MoA */}
                          <button
                            id={`open-contract-${cid}`}
                            onClick={() => onOpenContract(contract)}
                            className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-600 rounded border border-gray-200 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <FileSignature className="w-3.5 h-3.5" />
                            View MoA
                          </button>

                          {/* Deposit Funds CTA (fully_signed only) */}
                          {st === 'fully_signed' && (
                            <button
                              id={`deposit-funds-${cid}`}
                              onClick={() => onOpenPayment(contract)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                            >
                              Deposit Funds →
                            </button>
                          )}

                          {/* Release Payment CTA (funded only) */}
                          {st === 'funded' && (
                            <button
                              id={`release-payment-${cid}`}
                              onClick={() => onOpenPayment(contract)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
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
