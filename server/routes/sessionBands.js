import express from 'express';
import SessionBand from '../models/SessionBand.js';
import Contract from '../models/Contract.js';

const router = express.Router();

// GET /api/session-bands — filter by musicianId (creator or member) or gigId
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.gigId) filter.gigId = req.query.gigId;
    if (req.query.musicianId) {
      filter.$or = [
        { createdBy: req.query.musicianId },
        { 'members.musicianId': req.query.musicianId },
      ];
    }

    const bands = await SessionBand.find(filter)
      .populate('gigId', 'title venueName date')
      .populate('members.musicianId', 'name avatar instruments')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bands });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/session-bands/:id
router.get('/:id', async (req, res) => {
  try {
    const band = await SessionBand.findById(req.params.id)
      .populate('gigId', 'title venueName date')
      .populate('members.musicianId', 'name avatar instruments');
    if (!band) return res.status(404).json({ success: false, error: 'Session band not found' });
    res.json({ success: true, data: band });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/session-bands — create, creator is auto-accepted, invited members start pending
router.post('/', async (req, res) => {
  try {
    const { name, gigId, createdBy, members } = req.body;
    if (!name || !gigId || !createdBy) {
      return res.status(400).json({ success: false, error: 'name, gigId, and createdBy are required' });
    }

    // A session band can only be created for a gig createdBy is actually
    // confirmed for — not a speculative/pending booking that could fall through
    const confirmedBooking = await Contract.findOne({
      gigId,
      status: { $in: ['fully_signed', 'funded', 'partially_released', 'completed'] },
      $or: [{ musicianId: createdBy }, { 'payoutSplits.musicianId': createdBy }],
    });
    if (!confirmedBooking) {
      return res.status(400).json({
        success: false,
        error: "You can only create a session band for a gig you're already confirmed for",
      });
    }

    const memberRows = (members || [])
      .filter((m) => m.musicianId !== createdBy)
      .map((m) => ({ musicianId: m.musicianId, instrument: m.instrument || '', status: 'pending' }));

    const band = new SessionBand({
      name,
      gigId,
      createdBy,
      members: [
        { musicianId: createdBy, instrument: req.body.creatorInstrument || '', status: 'accepted', respondedAt: new Date() },
        ...memberRows,
      ],
    });
    await band.save();
    res.status(201).json({ success: true, data: band });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/session-bands/:id/members — invite additional members
router.post('/:id/members', async (req, res) => {
  try {
    const { musicianId, instrument } = req.body;
    const band = await SessionBand.findById(req.params.id);
    if (!band) return res.status(404).json({ success: false, error: 'Session band not found' });

    if (band.members.some((m) => m.musicianId.toString() === musicianId)) {
      return res.status(409).json({ success: false, error: 'Already invited to this session band' });
    }

    band.members.push({ musicianId, instrument: instrument || '', status: 'pending' });
    await band.save();
    res.status(201).json({ success: true, data: band });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/session-bands/:id/members/:musicianId/respond — accept/decline
router.patch('/:id/members/:musicianId/respond', async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' | 'declined'
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ success: false, error: "status must be 'accepted' or 'declined'" });
    }

    const band = await SessionBand.findById(req.params.id);
    if (!band) return res.status(404).json({ success: false, error: 'Session band not found' });

    const member = band.members.find((m) => m.musicianId.toString() === req.params.musicianId);
    if (!member) return res.status(404).json({ success: false, error: 'This musician is not part of this session band' });

    member.status = status;
    member.respondedAt = new Date();
    await band.save();
    res.json({ success: true, data: band });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/session-bands/:id/members/:musicianId — remove a member
router.delete('/:id/members/:musicianId', async (req, res) => {
  try {
    const band = await SessionBand.findById(req.params.id);
    if (!band) return res.status(404).json({ success: false, error: 'Session band not found' });

    band.members = band.members.filter((m) => m.musicianId.toString() !== req.params.musicianId);
    await band.save();
    res.json({ success: true, data: band });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
