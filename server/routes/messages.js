import express from 'express';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

const router = express.Router();

// GET /api/messages?conversationId=:id — fetch last 50 messages for a conversation
router.get('/', async (req, res) => {
  try {
    const { conversationId } = req.query;
    if (!conversationId) {
      return res.status(400).json({ success: false, error: 'conversationId is required' });
    }

    const messages = await Message.find({ conversationId })
      .sort({ sentAt: 1 })
      .limit(50);

    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/messages — REST fallback (Socket.io is the primary path)
router.post('/', async (req, res) => {
  try {
    const { conversationId, senderId, senderRole, senderName, content } = req.body;

    const message = new Message({ conversationId, senderId, senderRole, senderName, content });
    await message.save();

    // Update conversation's last message preview + increment unread for the OTHER party
    const unreadField = senderRole === 'organizer' ? 'unreadMusician' : 'unreadOrganizer';
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content,
      lastMessageAt: new Date(),
      $inc: { [unreadField]: 1 },
    });

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
