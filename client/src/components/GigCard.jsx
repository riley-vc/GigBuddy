import StatusBadge from './StatusBadge';

function formatPHP(amount) {
  if (!amount) return '—';
  return `₱${Number(amount).toLocaleString()}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function GigCard({ gig, isSelected, onClick }) {
  const genres = gig.requirements?.genres || [];

  return (
    <div
      onClick={() => onClick?.(gig)}
      className={`card-hover p-6 flex flex-col gap-3 animate-fade-in ${
        isSelected ? 'card-selected border-violet-500/60' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-zinc-50 text-base leading-snug truncate">
            {gig.title}
          </h3>
          <p className="text-sm text-zinc-500 mt-0.5 truncate">
            📍 {gig.venue}{gig.location ? `, ${gig.location}` : ''}
          </p>
        </div>
        <StatusBadge status={gig.status} />
      </div>

      {/* Info row */}
      <div className="flex items-center gap-4 text-sm text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="text-violet-400 text-xs">📅</span>
          {formatDate(gig.date)}
        </span>
        {gig.startTime && (
          <span className="flex items-center gap-1.5">
            <span className="text-violet-400 text-xs">⏰</span>
            {gig.startTime}{gig.endTime ? `–${gig.endTime}` : ''}
          </span>
        )}
      </div>

      {/* Budget */}
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-emerald-400 tracking-tight">
          {formatPHP(gig.budget)}
        </span>
        {gig.requirements?.backlineProvided && (
          <span className="tag-emerald text-xs">🎛️ Backline</span>
        )}
      </div>

      {/* Genre tags */}
      {genres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {genres.slice(0, 4).map((g) => (
            <span key={g} className="tag-violet text-xs">{g}</span>
          ))}
          {genres.length > 4 && (
            <span className="tag-zinc text-xs">+{genres.length - 4}</span>
          )}
        </div>
      )}
    </div>
  );
}
