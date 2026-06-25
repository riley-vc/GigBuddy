import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema(
  {
    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
    },
    musicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Denormalized musician display info (so we don't need to populate for list views)
    musicianName:   { type: String, default: '' },
    musicianAvatar: { type: String, default: '' },
    instrument:     { type: String, default: '' },
    skills:         { type: [String], default: [] },
    sampleVideoUrl: { type: String, default: '' },
    coverNote:      { type: String, default: '' },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    // 'musician' = musician applied; 'organizer' = organizer sent an invitation
    initiatedBy: {
      type: String,
      enum: ['musician', 'organizer'],
      default: 'musician',
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicate applications/invitations for the same gig+musician pair
ApplicationSchema.index({ gigId: 1, musicianId: 1 }, { unique: true });

export default mongoose.model('Application', ApplicationSchema);
