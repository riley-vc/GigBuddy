import mongoose from 'mongoose';

// General musician-to-musician chat — independent of any gig or team.
// Reuses the existing Message model (conversationId is a plain ObjectId,
// not enforced to a specific collection) exactly like TeamConversation does.
const DirectConversationSchema = new mongoose.Schema(
  {
    musicianAId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    musicianBId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Denormalized for list views (avoids extra populates)
    musicianAName: { type: String, default: '' },
    musicianBName: { type: String, default: '' },

    lastMessage:   { type: String, default: '' },
    lastMessageAt: { type: Date,   default: Date.now },

    // Unread counters (per participant, same pattern as Conversation's
    // unreadOrganizer/unreadMusician — always exactly 2 parties here)
    unreadA: { type: Number, default: 0 },
    unreadB: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One thread per musician pair, regardless of who started it
DirectConversationSchema.index({ musicianAId: 1, musicianBId: 1 }, { unique: true });

export default mongoose.model('DirectConversation', DirectConversationSchema);
