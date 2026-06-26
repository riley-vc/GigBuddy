import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // 'organizer' | 'musician'
    senderRole: {
      type: String,
      enum: ['organizer', 'musician'],
      required: true,
    },
    senderName: { type: String, default: '' },
    content:    { type: String, required: true, trim: true },
    sentAt:     { type: Date,   default: Date.now },
  },
  { timestamps: false } // sentAt is enough
);

// Index for fast conversation message fetching
MessageSchema.index({ conversationId: 1, sentAt: 1 });

export default mongoose.model('Message', MessageSchema);
