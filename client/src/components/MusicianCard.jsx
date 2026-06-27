// Generates a consistent colour from a name string
function avatarColor(name = '') {
  const colors = [
    'bg-violet-600', 'bg-indigo-600', 'bg-sky-600',
    'bg-emerald-600', 'bg-amber-600', 'bg-rose-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function MusicianCard({ musician, isSelected, onClick }) {
  const genres      = musician.genres      || [];
  const instruments = musician.instruments || [];
  const bg          = avatarColor(musician.name);

  return (
    <div
      onClick={() => onClick?.(musician)}
      className={`card-hover p-5 flex items-start gap-4 animate-fade-in ${
        isSelected ? 'card-selected border-violet-500/60' : ''
      }`}
    >
      {/* Avatar */}
      <div className={`w-11 h-11 rounded-full ${bg} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
        {musician.name?.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{musician.name}</p>

        {musician.location && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">📍 {musician.location}</p>
        )}

        {musician.bio && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
            {musician.bio}
          </p>
        )}

        {/* Genre chips */}
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {genres.slice(0, 3).map((g) => (
              <span key={g} className="tag-violet" style={{ fontSize: '11px' }}>{g}</span>
            ))}
            {genres.length > 3 && (
              <span className="tag-zinc" style={{ fontSize: '11px' }}>+{genres.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
