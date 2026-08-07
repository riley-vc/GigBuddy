import mongoose from 'mongoose';

// Peer review left by one party about the other after a contract completes.
// Automated policy adjustments (no-show, late payment, etc.) are NOT stored
// here — they nudge User.rating directly via server/utils/rating.js — this
// collection is only for actual person-authored reviews.
const ReviewSchema = new mongoose.Schema(
  {
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
    raterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    raterRole: {
      type: String,
      enum: ['organizer', 'musician'],
      required: true,
    },
    rateeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stars:   { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

// One review per person per contract
ReviewSchema.index({ contractId: 1, raterId: 1 }, { unique: true });

export default mongoose.model('Review', ReviewSchema);
