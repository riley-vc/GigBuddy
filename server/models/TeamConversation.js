import mongoose from 'mongoose';

// One persistent group thread per Team — reuses the existing Message model
// (Message.conversationId is a plain ObjectId, not enforced to a specific
// collection, so socket.io rooms and message storage work unchanged). Unlike
// the 1:1 gig Conversation, membership size varies, so unread counts are a
// map keyed by musicianId instead of two hardcoded fields.
const TeamConversationSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      unique: true,
    },
    teamName: { type: String, default: '' }, // denormalized for list views

    lastMessage:   { type: String, default: '' },
    lastMessageAt: { type: Date,   default: Date.now },

    // key: musicianId (string) → unread count for that member
    unreadByMember: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model('TeamConversation', TeamConversationSchema);
