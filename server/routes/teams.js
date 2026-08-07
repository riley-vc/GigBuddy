import express from 'express';
import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';
import TeamConversation from '../models/TeamConversation.js';

const router = express.Router();

// GET /api/teams — list teams (optional ?musicianId= scopes to a member's teams)
// Powers the ArtistMarketplace Solo/Bands toggle as its own parallel list.
router.get('/', async (req, res) => {
  try {
    if (req.query.musicianId) {
      const memberRows = await TeamMember.find({
        musicianId: req.query.musicianId,
        status: 'active',
      }).select('teamId');
      const teams = await Team.find({ _id: { $in: memberRows.map((m) => m.teamId) } }).sort({ name: 1 });
      return res.json({ success: true, data: teams });
    }

    const teams = await Team.find().sort({ name: 1 });
    res.json({ success: true, data: teams });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/teams/:id — single team profile, with active roster populated
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, error: 'Team not found' });

    const roster = await TeamMember.find({ teamId: team._id, status: 'active' })
      .populate('musicianId', 'name avatar instruments genres location');

    res.json({ success: true, data: { ...team.toObject(), roster } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/teams — create a team; creator becomes its founding manager
router.post('/', async (req, res) => {
  try {
    const { name, bio, genres, avatar, location, createdBy, defaultPayoutMode } = req.body;

    if (!name || !createdBy) {
      return res.status(400).json({ success: false, error: 'name and createdBy are required' });
    }

    const team = new Team({
      name,
      bio,
      genres,
      avatar,
      location,
      createdBy,
      defaultPayoutMode: defaultPayoutMode || 'lump_sum',
      defaultPayoutManagerId: createdBy,
    });
    await team.save();

    // Creator is the founding roster member + manager
    await TeamMember.create({
      teamId: team._id,
      musicianId: createdBy,
      role: 'manager',
      status: 'active',
    });

    // Group thread exists from the moment the team does
    await TeamConversation.create({ teamId: team._id, teamName: team.name });

    res.status(201).json({ success: true, data: team });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PATCH /api/teams/:id — edit profile fields or payout defaults
router.patch('/:id', async (req, res) => {
  try {
    const { name, bio, genres, avatar, location, defaultPayoutMode, defaultPayoutManagerId } = req.body;
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (genres !== undefined) updateFields.genres = genres;
    if (avatar !== undefined) updateFields.avatar = avatar;
    if (location !== undefined) updateFields.location = location;
    if (defaultPayoutMode !== undefined) updateFields.defaultPayoutMode = defaultPayoutMode;
    if (defaultPayoutManagerId !== undefined) updateFields.defaultPayoutManagerId = defaultPayoutManagerId;

    const team = await Team.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });
    if (!team) return res.status(404).json({ success: false, error: 'Team not found' });
    res.json({ success: true, data: team });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
