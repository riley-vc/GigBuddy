import mongoose from 'mongoose';

// Mirrors Application's invite/apply pattern, but for joining a Team instead
// of booking a gig. Accepting an invite spawns the corresponding TeamMember
// row (status: 'active').
const TeamInviteSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // must be a 'manager'-role TeamMember of teamId
    },
    musicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // invitee
    },
    instrument: { type: String, default: '' }, // proposed role in the band
    note:       { type: String, default: '' }, // async pitch, like Application.coverNote

    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// One OPEN invite per (team, musician) pair at a time — partial index so a
// musician who declined (or left) can be invited again later without the
// old resolved invite blocking a new one.
TeamInviteSchema.index(
  { teamId: 1, musicianId: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

export default mongoose.model('TeamInvite', TeamInviteSchema);
