import mongoose from 'mongoose';

// Temporary, gig-scoped lineup assignment — does NOT touch the band's
// permanent TeamMember roster (e.g. a stand-in drummer for one show).
// Feature 1 payout splits read payoutShare off this for substitutes whose
// pay applies only to the gig they actually played.
const SessionSlotSchema = new mongoose.Schema(
  {
    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    musicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    instrument: { type: String, required: true },

    // false when musicianId is already a permanent TeamMember of teamId —
    // true when this is an outside sub filling in for one gig only
    isSubstitute: { type: Boolean, default: false },

    // Gig-specific payout override (Feature 1). Resolved amount, same shape
    // as Contract.payoutSplits so the two can be reconciled at release time.
    payoutShare: {
      amount:    { type: Number, default: 0 },
      method:    { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
      rawValue:  { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// A musician can only fill one slot per gig — also the query shape used for
// conflict-checking (does this musicianId already have a slot on this date's
// gig before they can be assigned elsewhere).
SessionSlotSchema.index({ gigId: 1, musicianId: 1 }, { unique: true });
SessionSlotSchema.index({ musicianId: 1 });

export default mongoose.model('SessionSlot', SessionSlotSchema);
