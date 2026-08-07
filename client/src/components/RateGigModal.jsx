import { useState } from 'react';
import { X, Star, Loader2 } from 'lucide-react';

// Small modal for rating the other party on a completed contract. `ratee` is
// resolved by the caller (musicians list for organizers rating a musician,
// or just the raw name/avatar for a musician rating an organizer).
export default function RateGigModal({ isOpen, onClose, contract, currentUser, role, ratee, onSubmit }) {
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !contract || !ratee) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (stars === 0) { setError('Pick a star rating first.'); return; }
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        contractId: contract._id || contract.id,
        raterId: currentUser._id,
        raterRole: role,
        rateeId: ratee._id || ratee.id,
        stars,
        comment: comment.trim(),
      });
      setStars(0);
      setComment('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit rating.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayStars = hoverStars || stars;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full sm:max-w-sm bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              referrerPolicy="no-referrer"
              src={ratee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ratee.name)}&background=7c3aed&color=fff&size=80`}
              alt={ratee.name}
              className="w-10 h-10 rounded-xl object-cover border border-zinc-700"
            />
            <div>
              <h3 className="font-bold text-zinc-50 text-sm">Rate {ratee.name}</h3>
              <p className="text-[11px] text-zinc-500 truncate max-w-[200px]">{contract.gigTitle}</p>
            </div>
          </div>
          <button id="close-rate-gig-modal" onClick={onClose} className="text-zinc-400 hover:text-zinc-50 p-1.5 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex items-center justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                id={`rate-gig-star-${n}`}
                type="button"
                onClick={() => setStars(n)}
                onMouseEnter={() => setHoverStars(n)}
                onMouseLeave={() => setHoverStars(0)}
                className="p-1 cursor-pointer"
              >
                <Star className={`w-8 h-8 transition-colors ${n <= displayStars ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}`} />
              </button>
            ))}
          </div>

          <textarea
            id="rate-gig-comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Leave a comment (optional)…"
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg p-3 text-sm focus:outline-none focus:border-violet-500 resize-none placeholder:text-zinc-600"
          />

          {error && <p className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg py-2.5 text-xs font-semibold cursor-pointer">
              Cancel
            </button>
            <button
              id="submit-rate-gig-btn"
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-zinc-50 rounded-lg py-2.5 text-xs font-semibold cursor-pointer"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {submitting ? 'Submitting…' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
