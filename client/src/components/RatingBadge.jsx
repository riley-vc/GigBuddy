import { Star } from 'lucide-react';

// Shared star-rating pill — same visual language as PremiumBadge.jsx.
// `size` controls text/icon scale for use in tight card layouts vs. headers.
export default function RatingBadge({ rating, count = 0, size = 'sm', className = '' }) {
  if (rating == null) return null;
  const text = size === 'lg' ? 'text-sm' : 'text-[11px]';
  const icon = size === 'lg' ? 'w-4 h-4' : 'w-3 h-3';

  return (
    <span className={`inline-flex items-center gap-1 font-mono font-bold text-amber-400 ${text} ${className}`}>
      <Star className={`${icon} fill-amber-400`} />
      {rating.toFixed(1)}
      {count > 0 && <span className="text-zinc-500 font-normal">({count})</span>}
    </span>
  );
}
