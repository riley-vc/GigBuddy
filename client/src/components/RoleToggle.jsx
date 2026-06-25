import { Users, Music, AlertCircle } from 'lucide-react';

export default function RoleToggle({ role, onChange }) {
  return (
    <div
      id="role-toggle-bar"
      className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-lg"
    >
      <div className="flex items-center gap-2.5 text-xs text-zinc-400">
        <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div className="leading-normal">
          <span className="font-semibold text-zinc-300 block">Sandbox Switcher</span>
          <span>Toggle roles to simulate the end-to-end booking & contract loop!</span>
        </div>
      </div>

      <div className="flex p-1 bg-zinc-950 rounded-lg border border-zinc-800 self-stretch md:self-auto">
        <button
          id="toggle-role-organizer"
          onClick={() => onChange('organizer')}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
            role === 'organizer'
              ? 'bg-violet-600 text-zinc-50 shadow-md shadow-violet-600/15 font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Event Planner</span>
        </button>
        <button
          id="toggle-role-musician"
          onClick={() => onChange('musician')}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
            role === 'musician'
              ? 'bg-violet-600 text-zinc-50 shadow-md shadow-violet-600/15 font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Live Musician</span>
        </button>
      </div>
    </div>
  );
}
