import { MessageSquare, Bell, Calendar, MapPin, ChevronRight, Mail } from 'lucide-react';

function StatusPill({ status }) {
  const map = {
    pending:  { label: 'Pending',  cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    approved: { label: 'Approved', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    rejected: { label: 'Declined', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  };
  const cfg = map[status] || map.pending;
  return (
    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export default function InvitationInbox({
  conversations,   // conversations where musician is the recipient of an organizer invite
  applications,    // all applications (to get status + coverNote)
  onOpenChat,      // fn(conversationId)
}) {
  // Filter to organizer-initiated invitations only
  const inviteConvos = (conversations || []).filter((c) => {
    const app = (applications || []).find(
      (a) => a._id === c.applicationId || a.id === c.applicationId?.toString()
    );
    return app?.initiatedBy === 'organizer';
  });

  const totalUnread = inviteConvos.reduce((sum, c) => sum + (c.unreadMusician || 0), 0);

  if (inviteConvos.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-md">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
          <Mail className="w-4 h-4 text-violet-400" />
          <h3 className="font-bold text-zinc-50 text-sm">Planner Invitations</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <Bell className="w-5 h-5 text-zinc-600" />
          </div>
          <p className="text-zinc-500 text-sm">No invitations yet</p>
          <p className="text-zinc-600 text-xs leading-relaxed max-w-xs">
            When event planners invite you to gigs, they'll appear here with a direct message.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-md overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-violet-400" />
          <h3 className="font-bold text-zinc-50 text-sm">Planner Invitations</h3>
          {totalUnread > 0 && (
            <span className="px-1.5 py-0.5 bg-violet-600 text-white text-[10px] font-bold rounded-full min-w-[18px] text-center">
              {totalUnread}
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-zinc-500">
          {inviteConvos.length} invite{inviteConvos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Invitation Cards */}
      <div className="divide-y divide-zinc-800/60">
        {inviteConvos.map((convo) => {
          const app = (applications || []).find(
            (a) => a._id === convo.applicationId || a.id === convo.applicationId?.toString()
          );
          const hasUnread = (convo.unreadMusician || 0) > 0;

          return (
            <button
              key={convo._id}
              id={`invitation-card-${convo._id}`}
              onClick={() => onOpenChat(convo._id)}
              className="w-full text-left px-5 py-4 hover:bg-zinc-800/40 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                {/* Unread dot */}
                <div className="mt-1.5 shrink-0">
                  {hasUnread ? (
                    <span className="w-2 h-2 rounded-full bg-violet-500 block" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-zinc-700 block" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Gig Title + Status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold truncate ${hasUnread ? 'text-zinc-50' : 'text-zinc-300'}`}>
                      {convo.gigTitle || 'Gig Invitation'}
                    </span>
                    {app && <StatusPill status={app.status} />}
                  </div>

                  {/* Organizer name */}
                  <p className="text-[11px] text-violet-400 font-medium">
                    from {convo.organizerName || 'Event Planner'}
                  </p>

                  {/* Venue + Budget */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {convo.venueName && (
                      <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                        <MapPin className="w-3 h-3" />{convo.venueName}
                      </span>
                    )}
                    {convo.gigBudget > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                        ₱{convo.gigBudget.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Last message preview */}
                  {convo.lastMessage && (
                    <p className="text-[11px] text-zinc-500 truncate italic">
                      "{convo.lastMessage}"
                    </p>
                  )}
                </div>

                {/* Open Chat button */}
                <div className="shrink-0 flex flex-col items-end gap-2 pt-0.5">
                  {hasUnread && (
                    <span className="px-1.5 py-0.5 bg-violet-600 text-white text-[9px] font-bold rounded-full">
                      {convo.unreadMusician}
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-[10px] text-violet-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    <MessageSquare className="w-3 h-3" />
                    <span>Chat</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
