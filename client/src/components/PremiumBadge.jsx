import { Crown } from 'lucide-react';

// Shared "Premium" pill — matches the pill-badge visual language used
// throughout the app (e.g. Manager/Payout Mgr badges in BandPage.jsx).
export default function PremiumBadge({ compact = false, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 ${className}`}
    >
      <Crown className="w-2.5 h-2.5" />
      {!compact && 'Premium'}
    </span>
  );
}
