import { MessageSquare, Bell, Calendar, DollarSign, MapPin, ChevronRight, Mail } from 'lucide-react';

function StatusPill({ status }) {
  const map = {
    pending:  { label: 'Pending',  cls: 'bg-amber-50 text-amber-600 border-amber-100' },
    approved: { label: 'Approved', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    rejected: { label: 'Declined', cls: 'bg-red-50 text-red-600 border-red-100' },
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
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <Mail className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-gray-900 text-sm">Planner Invitations</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center">
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No invitations yet</p>
          <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
            When event planners invite you to gigs, they'll appear here with a direct message.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      {/* Section Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-gray-900 text-sm">Planner Invitations</h3>
          {totalUnread > 0 && (
            <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full min-w-[18px] text-center">
              {totalUnread}
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-gray-500">
          {inviteConvos.length} invite{inviteConvos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Invitation Cards */}
      <div className="divide-y divide-gray-100">
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
              className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                {/* Unread dot */}
                <div className="mt-1.5 shrink-0">
                  {hasUnread ? (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 block" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-300 block" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Gig Title + Status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                      {convo.gigTitle || 'Gig Invitation'}
                    </span>
                    {app && <StatusPill status={app.status} />}
                  </div>

                  {/* Organizer name */}
                  <p className="text-[11px] text-indigo-600 font-medium">
                    from {convo.organizerName || 'Event Planner'}
                  </p>

                  {/* Venue + Budget */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {convo.venueName && (
                      <span className="flex items-center gap-1 text-[10px] text-gray-500">
                        <MapPin className="w-3 h-3" />{convo.venueName}
                      </span>
                    )}
                    {convo.gigBudget > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-mono">
                        <DollarSign className="w-3 h-3" />{convo.gigBudget.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Last message preview */}
                  {convo.lastMessage && (
                    <p className="text-[11px] text-gray-500 truncate italic">
                      "{convo.lastMessage}"
                    </p>
                  )}
                </div>

                {/* Open Chat button */}
                <div className="shrink-0 flex flex-col items-end gap-2 pt-0.5">
                  {hasUnread && (
                    <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded-full">
                      {convo.unreadMusician}
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
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
