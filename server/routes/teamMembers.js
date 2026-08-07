import express from 'express';
import TeamMember from '../models/TeamMember.js';

const router = express.Router();

// GET /api/team-members — filter by teamId and/or musicianId
// Removed rows are hidden by default (pass ?status=removed to see them)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.teamId) filter.teamId = req.query.teamId;
    if (req.query.musicianId) filter.musicianId = req.query.musicianId;
    filter.status = req.query.status || { $ne: 'removed' };

    const members = await TeamMember.find(filter)
      .populate('musicianId', 'name avatar instruments')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: members });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/team-members/:id — promote/demote a role, change instrument, or remove
// NOTE: Phase 1 has no server-side auth (matches every other route in this
// app) — the client is trusted to only expose this to a team's managers.
router.patch('/:id', async (req, res) => {
  try {
    const { role, status, instrument } = req.body;
    const updateFields = {};
    if (role !== undefined) updateFields.role = role;
    if (status !== undefined) updateFields.status = status;
    if (instrument !== undefined) updateFields.instrument = instrument;

    const member = await TeamMember.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });
    if (!member) return res.status(404).json({ success: false, error: 'Team member not found' });
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
