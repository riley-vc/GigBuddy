import { X, PlayCircle } from 'lucide-react';

const STEPS = [
  ['01. INVITE ARTIST', 'Go to Artists tab → pick a musician → Send Direct Invitation with a personal note.'],
  ['02. OPEN CHAT', 'After inviting, tap "Open Chat" to start a real-time conversation with that artist.'],
  ['03. SWITCH TO MUSICIAN', 'Toggle role to Live Musician → Dashboard → check Planner Invitations inbox.'],
  ['04. REPLY IN INBOX', 'Open the invitation card — the chat drawer opens. Reply to the planner in real-time!'],
  ['05. SIGN THE MoA', 'Back in Planner mode, approve the application → Draft MoA → Sign to lock escrow.'],
];

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — full-width bottom sheet on mobile, centered modal on sm+ */}
      <div className="relative w-full sm:max-w-2xl bg-zinc-900 border border-zinc-700 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up sm:animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-violet-400" />
            <h2 className="font-bold text-sm text-zinc-100">Sandbox Flow Guide</h2>
          </div>
          <button
            id="help-modal-close"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps */}
        <div className="p-5 space-y-3">
          {STEPS.map(([step, desc]) => (
            <div key={step} className="flex items-start gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
              <span className="font-mono text-violet-400 font-bold text-xs shrink-0 mt-0.5 min-w-[100px]">
                {step}
              </span>
              <p className="text-zinc-400 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Safe-area spacer on mobile */}
        <div className="pb-safe sm:pb-0" />
      </div>
    </div>
  );
}
