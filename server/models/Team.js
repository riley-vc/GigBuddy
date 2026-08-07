import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    bio:      { type: String, default: '' },
    genres:   { type: [String], default: [] },
    avatar:   { type: String, default: '' },
    location: { type: String, default: '' },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Feature 1 — payout defaults, overridable per gig on the Contract itself
    defaultPayoutMode: {
      type: String,
      enum: ['lump_sum', 'per_member'],
      default: 'lump_sum',
    },
    defaultPayoutManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Team', TeamSchema);
