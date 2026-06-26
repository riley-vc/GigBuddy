import express from 'express';
import Conversation from '../models/Conversation.js';

const router = express.Router();

// GET /api/conversations — list by organizerId or musicianId
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.organizerId) filter.organizerId = req.query.organizerId;
    if (req.query.musicianId)  filter.musicianId  = req.query.musicianId;

    const conversations = await Conversation.find(filter)
      .sort({ lastMessageAt: -1 });

    res.json({ success: true, data: conversations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/conversations/:id — single conversation
router.get('/:id', async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ success: false, error: 'Conversation not found' });
    res.json({ success: true, data: convo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/conversations — create a new conversation
// Called automatically from the applications route when an invite/application is created
router.post('/', async (req, res) => {
  try {
    const {
      applicationId,
      gigId,
      organizerId,
      musicianId,
      gigTitle,
      venueName,
      musicianName,
      organizerName,
      gigBudget,
    } = req.body;

    // Guard: only one conversation per application
    const existing = await Conversation.findOne({ applicationId });
    if (existing) {
      return res.status(200).json({ success: true, data: existing });
    }

    const convo = new Conversation({
      applicationId,
      gigId,
      organizerId,
      musicianId,
      gigTitle,
      venueName,
      musicianName,
      organizerName,
      gigBudget,
    });

    await convo.save();
    res.status(201).json({ success: true, data: convo });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/conversations/:id/read — reset unread count for a role
router.patch('/:id/read', async (req, res) => {
  try {
    const { role } = req.body; // 'organizer' | 'musician'
    const update = role === 'organizer'
      ? { unreadOrganizer: 0 }
      : { unreadMusician: 0 };

    const convo = await Conversation.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!convo) return res.status(404).json({ success: false, error: 'Conversation not found' });
    res.json({ success: true, data: convo });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
