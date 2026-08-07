import mongoose from 'mongoose';

// Permanent roster relationship (many-to-many — a musician can be an active
// TeamMember of multiple Teams at once, e.g. a session player who's core to
// one band and gigs regularly with another).
const TeamMemberSchema = new mongoose.Schema(
  {
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
    role: {
      type: String,
      enum: ['member', 'manager'],
      default: 'member',
    },
    instrument: { type: String, default: '' }, // their role within THIS band specifically

    // pending until a TeamInvite is accepted; removed instead of deleted so
    // roster history survives (e.g. for past-gig payout records)
    status: {
      type: String,
      enum: ['pending', 'active', 'removed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// One relationship row per (team, musician) pair
TeamMemberSchema.index({ teamId: 1, musicianId: 1 }, { unique: true });

export default mongoose.model('TeamMember', TeamMemberSchema);
