import { useState, useEffect, useRef, useMemo } from 'react';

// Generates HH:MM options in 30-minute intervals
function generateTimes() {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh   = String(h).padStart(2, '0');
      const mm   = String(m).padStart(2, '0');
      const value = `${hh}:${mm}`;
      const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const ampm  = h < 12 ? 'AM' : 'PM';
      const label = `${String(displayH).padStart(2, '0')}:${mm} ${ampm}`;
      times.push({ value, label });
    }
  }
  return times;
}

const ALL_TIMES = generateTimes();

export default function TimeDropdown({ id, value, onChange, placeholder = 'Select time', error }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const listRef      = useRef(null);

  // Close on outside click
  useEffect(() => {
    function onOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  // Scroll selected item into view when opening
  useEffect(() => {
    if (open && value && listRef.current) {
      const idx = ALL_TIMES.findIndex((t) => t.value === value);
      if (idx !== -1) {
        const item = listRef.current.children[idx];
        item?.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [open, value]);

  const selected = ALL_TIMES.find((t) => t.value === value);

  return (
    <div className="relative" ref={containerRef}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`input flex items-center justify-between text-left ${
          error ? 'border-rose-500/60 focus:ring-rose-500/40' : ''
        }`}
      >
        <span className={selected ? 'text-zinc-100' : 'text-zinc-600'}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-zinc-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden z-50 shadow-2xl shadow-black/60 animate-fade-in">
          <div ref={listRef} className="max-h-52 overflow-y-auto py-1">
            {ALL_TIMES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => { onChange(t.value); setOpen(false); }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors duration-100 ${
                  value === t.value
                    ? 'bg-violet-500/15 text-violet-300 font-medium'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
