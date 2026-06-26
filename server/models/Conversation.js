import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema(
  {
    // Scoped to a single application (gig + musician pair)
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      unique: true,
    },
    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    musicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Denormalized for list views (avoids extra populates)
    gigTitle:      { type: String, default: '' },
    venueName:     { type: String, default: '' },
    musicianName:  { type: String, default: '' },
    organizerName: { type: String, default: '' },
    gigBudget:     { type: Number, default: 0 },

    // Last message preview
    lastMessage:   { type: String, default: '' },
    lastMessageAt: { type: Date,   default: Date.now },

    // Unread counters (per role)
    unreadOrganizer: { type: Number, default: 0 },
    unreadMusician:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Conversation', ConversationSchema);
