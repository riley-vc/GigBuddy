import express from 'express';
import DirectConversation from '../models/DirectConversation.js';

const router = express.Router();

// GET /api/direct-conversations?musicianId=X — threads involving this musician
router.get('/', async (req, res) => {
  try {
    const { musicianId } = req.query;
    const filter = musicianId
      ? { $or: [{ musicianAId: musicianId }, { musicianBId: musicianId }] }
      : {};
    const convos = await DirectConversation.find(filter).sort({ lastMessageAt: -1 });
    res.json({ success: true, data: convos });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/direct-conversations/:id
router.get('/:id', async (req, res) => {
  try {
    const convo = await DirectConversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ success: false, error: 'Conversation not found' });
    res.json({ success: true, data: convo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/direct-conversations — find-or-create a thread between two musicians
router.post('/', async (req, res) => {
  try {
    const { musicianId, otherMusicianId, musicianName, otherMusicianName } = req.body;
    if (!musicianId || !otherMusicianId) {
      return res.status(400).json({ success: false, error: 'musicianId and otherMusicianId are required' });
    }
    if (musicianId === otherMusicianId) {
      return res.status(400).json({ success: false, error: "Can't start a conversation with yourself" });
    }

    // Canonical ordering so (A,B) and (B,A) always resolve to the same thread
    const [idA, idB] = [musicianId, otherMusicianId].sort();
    const nameA = idA === musicianId ? musicianName : otherMusicianName;
    const nameB = idB === musicianId ? musicianName : otherMusicianName;

    const existing = await DirectConversation.findOne({ musicianAId: idA, musicianBId: idB });
    if (existing) {
      return res.json({ success: true, data: existing });
    }

    const convo = new DirectConversation({
      musicianAId: idA,
      musicianBId: idB,
      musicianAName: nameA || '',
      musicianBName: nameB || '',
    });
    await convo.save();
    res.status(201).json({ success: true, data: convo });
  } catch (err) {
    if (err.code === 11000) {
      // Race: another request created it between our findOne and save
      const [idA, idB] = [req.body.musicianId, req.body.otherMusicianId].sort();
      const existing = await DirectConversation.findOne({ musicianAId: idA, musicianBId: idB });
      if (existing) return res.json({ success: true, data: existing });
    }
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/direct-conversations/:id/read — mark read for one participant
router.patch('/:id/read', async (req, res) => {
  try {
    const { musicianId } = req.body;
    const convo = await DirectConversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ success: false, error: 'Conversation not found' });

    const update = musicianId === convo.musicianAId.toString() ? { unreadA: 0 } : { unreadB: 0 };
    const updated = await DirectConversation.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
