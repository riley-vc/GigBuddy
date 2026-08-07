import mongoose from 'mongoose';

// A lightweight, one-off group tied to a single event — distinct from Team.
// No long-term roster, no payout-manager defaults; it exists to assemble a
// lineup for one gig. Contract.sessionBandId points here instead of Team
// when the booking is for a session band rather than a permanent act.
const SessionBandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        musicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        instrument: { type: String, default: '' },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'declined'],
          default: 'pending',
        },
        respondedAt: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('SessionBand', SessionBandSchema);
