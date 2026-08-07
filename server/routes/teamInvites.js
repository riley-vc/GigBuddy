import express from 'express';
import TeamInvite from '../models/TeamInvite.js';
import TeamMember from '../models/TeamMember.js';

const router = express.Router();

// GET /api/team-invites — filter by teamId and/or musicianId (the invitee)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.teamId) filter.teamId = req.query.teamId;
    if (req.query.musicianId) filter.musicianId = req.query.musicianId;
    if (req.query.status) filter.status = req.query.status;

    const invites = await TeamInvite.find(filter)
      .populate('teamId', 'name avatar genres')
      .populate('invitedBy', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: invites });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/team-invites — a manager invites a musician to join their team
router.post('/', async (req, res) => {
  try {
    const { teamId, invitedBy, musicianId, instrument, note } = req.body;

    if (!teamId || !invitedBy || !musicianId) {
      return res.status(400).json({ success: false, error: 'teamId, invitedBy, and musicianId are required' });
    }

    const alreadyMember = await TeamMember.findOne({ teamId, musicianId, status: 'active' });
    if (alreadyMember) {
      return res.status(409).json({ success: false, error: 'Musician is already on this team' });
    }

    const invite = new TeamInvite({ teamId, invitedBy, musicianId, instrument, note });
    await invite.save();
    res.status(201).json({ success: true, data: invite });
  } catch (err) {
    // Partial unique index on {teamId, musicianId, status:'pending'} catches double-invites
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: 'This musician already has a pending invite from this team' });
    }
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/team-invites/:id/status — invitee accepts or declines
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' | 'declined'
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ success: false, error: "status must be 'accepted' or 'declined'" });
    }

    const invite = await TeamInvite.findById(req.params.id);
    if (!invite) return res.status(404).json({ success: false, error: 'Invite not found' });
    if (invite.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'This invite has already been resolved' });
    }

    invite.status = status;
    await invite.save();

    if (status === 'accepted') {
      // Upsert, not insert — a previously-removed member re-joining would
      // otherwise collide with TeamMember's unique (teamId, musicianId) index
      await TeamMember.findOneAndUpdate(
        { teamId: invite.teamId, musicianId: invite.musicianId },
        { role: 'member', status: 'active', instrument: invite.instrument },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    res.json({ success: true, data: invite });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
