import { Users, Music, AlertCircle } from 'lucide-react';

export default function RoleToggle({ role, onChange }) {
  return (
    <div
      id="role-toggle-bar"
      className="bg-white border border-gray-200 p-2.5 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm"
    >
      <div className="flex items-center gap-2.5 text-xs text-gray-500">
        <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg shrink-0 border border-amber-100">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div className="leading-normal">
          <span className="font-semibold text-gray-700 block">Sandbox Switcher</span>
          <span>Toggle roles to simulate the end-to-end booking &amp; contract loop!</span>
        </div>
      </div>

      <div className="flex p-1 bg-gray-100 rounded-lg border border-gray-200 self-stretch md:self-auto">
        <button
          id="toggle-role-organizer"
          onClick={() => onChange('organizer')}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
            role === 'organizer'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white'
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
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Live Musician</span>
        </button>
      </div>
    </div>
  );
}

